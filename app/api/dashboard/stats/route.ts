import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'today';

        // --- FECHAS DINÁMICAS ---
        const now = new Date();
        const todayLiteral = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));

        let startDate: Date;
        if (period === 'week') {
            startDate = new Date(todayLiteral);
            startDate.setUTCDate(startDate.getUTCDate() - 6);
        } else if (period === 'month') {
            startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
        } else {
            startDate = todayLiteral;
        }

        // 1. Turnos activos
        const activeShifts = await prisma.shift.findMany({
            where: { Status: 0, GCRecord: null },
            select: { Oid: true, Name: true }
        });
        const activeShiftOids = activeShifts.map(s => s.Oid.trim());

        // Fetch shift timetables and fixed timetables in parallel
        const [shiftTimetables, timetablesFixed] = await Promise.all([
            prisma.shifttimetable.findMany({
                select: { Shift: true, NumberDay: true, Timetable: true }
            }),
            prisma.timetablefixed.findMany({
                select: { Oid: true, MarkingIn: true, Delay: true }
            })
        ]);

        const shiftTimetableMap = new Map<string, string>();
        shiftTimetables.forEach(st => {
            if (st.Shift && st.Timetable && st.NumberDay !== null) {
                shiftTimetableMap.set(`${st.Shift.trim()}_${st.NumberDay}`, st.Timetable.trim());
            }
        });

        const timetableFixedMap = new Map<string, { markingIn: number; delay: number }>();
        timetablesFixed.forEach(tf => {
            timetableFixedMap.set(tf.Oid.trim(), {
                markingIn: tf.MarkingIn || 0,
                delay: tf.Delay || 0
            });
        });

        // Helper to check if a marking is late based on shift schedule (laxo de 10 minutos)
        const checkIsLate = (markingIn: Date | null, day: Date | null, shiftOid: string | null, empCurrentShift: string | null) => {
            if (!markingIn) return false;
            
            const hours = markingIn.getUTCHours();
            const minutes = markingIn.getUTCMinutes();
            const seconds = markingIn.getUTCSeconds();
            const arrivalSeconds = hours * 3600 + minutes * 60 + seconds;

            const shiftClean = shiftOid?.trim() || empCurrentShift?.trim() || '';
            if (!shiftClean) {
                return arrivalSeconds > (375 * 60); // 06:15 AM fallback
            }

            // Compensar desfases de zona horaria sumando 12 horas antes de obtener el día de la semana
            const adjustedDay = day ? new Date(new Date(day).getTime() + 12 * 60 * 60 * 1000) : null;
            const dayOfWeek = adjustedDay ? adjustedDay.getUTCDay() : 1;
            const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

            const timetableOid = shiftTimetableMap.get(`${shiftClean}_${numberDay}`);
            const fixedDetails = timetableOid ? timetableFixedMap.get(timetableOid) : null;

            if (fixedDetails && fixedDetails.markingIn > 0) {
                const limitSeconds = fixedDetails.markingIn + 600; // 10 minutos de tolerancia (600 segundos)
                return arrivalSeconds > limitSeconds;
            }

            // Si tiene turno pero no hay horario asignado para este día o markingIn es 0 (ej. opcional/no laborable), no es retardo
            return false;
        };

        // 2. Métricas base, empleados y epersons en paralelo
        const [totalEmpleados, marcacionesPeriodo, allEmployees, allEpersons, marcacionesHoy] = await Promise.all([
            prisma.employee.count(),
            prisma.marking.count({ where: { Day: { gte: startDate, lte: todayLiteral } } }),
            prisma.employee.findMany({
                select: { Oid: true, CurrentShift: true, Department: true }
            }),
            prisma.eperson.findMany({
                select: { Oid: true, FullName: true, FirstName: true, LastName: true, Document: true }
            }),
            prisma.marking.findMany({
                where: { Day: todayLiteral },
                select: { MarkingIn: true, Employee: true, Shift: true, Day: true }
            })
        ]);

        const empDataMap = new Map(allEmployees.map(e => [e.Oid.trim(), e]));
        const personMap = new Map(allEpersons.map(p => [
            p.Oid.trim(),
            p.FullName || `${p.FirstName || ''} ${p.LastName || ''}`.trim() || p.Document || 'Desconocido'
        ]));

        const activeEmployees = allEmployees.filter(e => e.CurrentShift && activeShiftOids.includes(e.CurrentShift.trim()));
        const activeEmpOids = activeEmployees.map(e => e.Oid.trim());

        // 4. Departamentos
        const departamentos = await prisma.department.findMany({
            where: { GCRecord: null },
            select: { Oid: true, Name: true }
        });
        const deptNameMap = new Map(departamentos.map(d => [d.Oid.trim(), d.Name || 'Sin Nombre']));

        // Group active employees by CurrentShift to count total employees per shift
        const shiftEmployeeCounts = new Map<string, number>();
        activeEmployees.forEach(e => {
            if (e.CurrentShift) {
                const shiftClean = e.CurrentShift.trim();
                shiftEmployeeCounts.set(shiftClean, (shiftEmployeeCounts.get(shiftClean) || 0) + 1);
            }
        });

        // Group all employees by Department to get employee counts per department
        const deptEmployeeCounts = new Map<string, number>();
        allEmployees.forEach(e => {
            if (e.Department) {
                const deptClean = e.Department.trim();
                deptEmployeeCounts.set(deptClean, (deptEmployeeCounts.get(deptClean) || 0) + 1);
            }
        });

        const shiftStats = new Map<string, { late: number; onTime: number; total: number }>();
        activeShifts.forEach(s => shiftStats.set(s.Oid.trim(), { late: 0, onTime: 0, total: 0 }));
        shiftEmployeeCounts.forEach((count, shiftOid) => {
            if (shiftStats.has(shiftOid)) {
                shiftStats.get(shiftOid)!.total = count;
            }
        });

        const deptPunct = new Map<string, { onTime: number; late: number }>();
        let totalPuntuales = 0;
        let totalRetrasos = 0;

        const listPuntuales: { nombre: string; departamento: string; turno: string }[] = [];
        const listRetrasos: { nombre: string; departamento: string; turno: string }[] = [];
        const listAusentes: { nombre: string; departamento: string; turno: string }[] = [];

        const shiftNameMap = new Map(activeShifts.map(s => [s.Oid.trim(), s.Name || 'Sin Turno']));
        const markedOidsSet = new Set<string>();

        let sotoDebug: any = null;

        for (const m of marcacionesHoy) {
            if (!m.Employee) continue;
            const empOidClean = m.Employee.trim();
            markedOidsSet.add(empOidClean);

            const empData = empDataMap.get(empOidClean);
            const nombre = personMap.get(empOidClean) || 'Desconocido';

            const shiftOid = m.Shift?.trim() || empData?.CurrentShift?.trim();
            const shiftClean = shiftOid ? shiftOid.trim() : '';
            const turno = shiftClean ? (shiftNameMap.get(shiftClean) || 'Sin Turno') : 'Sin Turno';

            const deptOid = empData?.Department?.trim();
            let departamento = deptOid ? (deptNameMap.get(deptOid) || 'Sin Departamento') : 'Sin Departamento';
            departamento = departamento.replace(/^(7 DE AGOSTO|CALLE 4|CALLE 4TA)\//i, "");

            const item = { nombre, departamento, turno };

            if (nombre.toUpperCase().includes("SOTO")) {
                const adjustedDay = m.Day ? new Date(new Date(m.Day).getTime() + 12 * 60 * 60 * 1000) : null;
                const dayOfWeek = adjustedDay ? adjustedDay.getUTCDay() : 1;
                const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;
                const timetableOid = shiftClean ? shiftTimetableMap.get(`${shiftClean}_${numberDay}`) : null;
                const fixedDetails = timetableOid ? timetableFixedMap.get(timetableOid) : null;
                sotoDebug = {
                    nombre,
                    markingIn: m.MarkingIn ? m.MarkingIn.toISOString() : null,
                    markingInUTCHours: m.MarkingIn ? m.MarkingIn.getUTCHours() : null,
                    markingInUTCMinutes: m.MarkingIn ? m.MarkingIn.getUTCMinutes() : null,
                    day: m.Day ? m.Day.toISOString() : null,
                    dayOfWeek,
                    numberDay,
                    shiftOid,
                    shiftClean,
                    timetableOid,
                    fixedDetails,
                    shiftTimetableMapKeys: Array.from(shiftTimetableMap.keys()).filter(k => k.startsWith(shiftClean)),
                    timetableFixedMapKeys: Array.from(timetableFixedMap.keys())
                };
                try {
                    fs.writeFileSync("c:/proyectos/oclock/debug_output.json", JSON.stringify(sotoDebug, null, 2));
                } catch (e) {}
            }

            if (m.MarkingIn) {
                const isLate = checkIsLate(m.MarkingIn, m.Day, m.Shift, empData?.CurrentShift || null);

                if (isLate) {
                    totalRetrasos++;
                    listRetrasos.push(item);
                } else {
                    totalPuntuales++;
                    listPuntuales.push(item);
                }

                if (shiftClean && shiftStats.has(shiftClean)) {
                    if (isLate) shiftStats.get(shiftClean)!.late++;
                    else shiftStats.get(shiftClean)!.onTime++;
                }

                if (deptOid) {
                    const deptClean = deptOid.trim();
                    if (!deptPunct.has(deptClean))
                        deptPunct.set(deptClean, { onTime: 0, late: 0 });
                    const dp = deptPunct.get(deptClean)!;
                    if (isLate) dp.late++; else dp.onTime++;
                }
            } else {
                totalPuntuales++;
                listPuntuales.push(item);
                
                if (shiftClean && shiftStats.has(shiftClean)) {
                    shiftStats.get(shiftClean)!.onTime++;
                }
                if (deptOid) {
                    const deptClean = deptOid.trim();
                    if (!deptPunct.has(deptClean))
                        deptPunct.set(deptClean, { onTime: 0, late: 0 });
                    deptPunct.get(deptClean)!.onTime++;
                }
            }
        }

        // Empleados activos ausentes
        for (const emp of activeEmployees) {
            const empOidClean = emp.Oid.trim();
            if (markedOidsSet.has(empOidClean)) continue;

            const nombre = personMap.get(empOidClean) || 'Desconocido';
            const shiftOid = emp.CurrentShift?.trim();
            const shiftClean = shiftOid ? shiftOid.trim() : '';
            const turno = shiftClean ? (shiftNameMap.get(shiftClean) || 'Sin Turno') : 'Sin Turno';

            const deptOid = emp.Department?.trim();
            let departamento = deptOid ? (deptNameMap.get(deptOid) || 'Sin Departamento') : 'Sin Departamento';
            departamento = departamento.replace(/^(7 DE AGOSTO|CALLE 4|CALLE 4TA)\//i, "");

            listAusentes.push({ nombre, departamento, turno });
        }

        // 8. Retrasos por turno
        const retrasosPorTurno = activeShifts.map(s => {
            const st = shiftStats.get(s.Oid.trim())!;
            return {
                turno: s.Name || 'Sin Nombre',
                retrasos: st.late,
                total: st.total || 1,
                tasa: Math.round((st.late / (st.total || 1)) * 100)
            };
        }).filter(s => s.total > 1).sort((a, b) => b.retrasos - a.retrasos).slice(0, 5);

        // 9. Cumplimiento REAL por departamento
        const cumplimientoPorDepartamento = Array.from(deptEmployeeCounts.entries())
            .filter(([deptOid]) => deptNameMap.has(deptOid))
            .map(([deptOid, count]) => {
                const dp = deptPunct.get(deptOid) || { onTime: 0, late: 0 };
                const tot = dp.onTime + dp.late;
                return {
                    departamento: deptNameMap.get(deptOid) || 'Sin Nombre',
                    cumplimiento: tot > 0 ? Math.round((dp.onTime / tot) * 100) : 100,
                    empleados: count
                };
            })
            .filter(d => d.empleados > 2)
            .sort((a, b) => b.empleados - a.empleados)
            .slice(0, 6);

        // 10. Tendencia real según período (semana, quincena y mes en un solo payload)
        const tendencia = await calcularTodasTendencias(todayLiteral, empDataMap, checkIsLate);

        // 11. Alertas dinámicas
        const alertas = generarAlertas(cumplimientoPorDepartamento, retrasosPorTurno, totalPuntuales, totalRetrasos);

        // 12. Ausentes reales (empleados con turno que no marcaron hoy)
        const ausentesHoy = listAusentes.length;

        // 13. Incidencias del mes (marcaciones sin salida)
        const incidenciasMes = await prisma.marking.count({
            where: {
                Day: { gte: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)), lt: todayLiteral },
                MarkingOut: null
            }
        });

        return NextResponse.json({
            sotoDebug,
            metricasGenerales: {
                totalEmpleados,
                activosHoy: period === 'today' ? marcacionesHoy.length : marcacionesPeriodo,
                promedioCumplimiento: (totalPuntuales + totalRetrasos) > 0
                    ? Math.round((totalPuntuales / (totalPuntuales + totalRetrasos)) * 100) : 0,
                incidenciasMes
            },
            marcacionesHoy: {
                puntuales: totalPuntuales,
                retrasos: totalRetrasos,
                ausentes: ausentesHoy,
                total: period === 'today' ? marcacionesHoy.length : marcacionesPeriodo
            },
            cumplimientoPorDepartamento,
            retrasosPorTurno,
            tendencia,
            alertas,
            detallesHoy: {
                puntuales: listPuntuales,
                retrasos: listRetrasos,
                ausentes: listAusentes
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Error al calcular estadísticas", detail: String(error) }, { status: 500 });
    }
}

async function calcularTodasTendencias(
    todayLiteral: Date,
    empDataMap: Map<string, { CurrentShift: string | null; Department: string | null }>,
    checkIsLate: (markingIn: Date | null, day: Date | null, shiftOid: string | null, empCurrentShift: string | null) => boolean
) {
    const startDate30 = new Date(todayLiteral);
    startDate30.setUTCDate(startDate30.getUTCDate() - 29); // Últimos 30 días incluyendo hoy

    // Obtener todas las marcaciones de los últimos 30 días en una sola consulta
    const markings = await prisma.marking.findMany({
        where: {
            Day: {
                gte: startDate30,
                lte: todayLiteral
            }
        },
        select: {
            Day: true,
            MarkingIn: true,
            Employee: true,
            Shift: true
        }
    });

    // Agrupar por YYYY-MM-DD
    const markingsByDay = new Map<string, { total: number; onTime: number }>();
    markings.forEach(m => {
        if (!m.Day) return;
        const dateStr = m.Day.toISOString().split('T')[0];
        if (!markingsByDay.has(dateStr)) {
            markingsByDay.set(dateStr, { total: 0, onTime: 0 });
        }
        const dayData = markingsByDay.get(dateStr)!;
        dayData.total++;
        if (m.MarkingIn) {
            const empData = m.Employee ? empDataMap.get(m.Employee.trim()) : null;
            const isLate = checkIsLate(m.MarkingIn, m.Day, m.Shift, empData?.CurrentShift || null);
            if (!isLate) {
                dayData.onTime++;
            }
        }
    });

    const formatDayName = (date: Date) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[date.getUTCDay()];
    };

    const getTrendForDays = (numDays: number) => {
        const results = [];
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date(todayLiteral);
            d.setUTCDate(d.getUTCDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayData = markingsByDay.get(dateStr) || { total: 0, onTime: 0 };
            
            // Si no hay marcaciones, asumimos 100% de cumplimiento por defecto
            const valor = dayData.total > 0 ? Math.round((dayData.onTime / dayData.total) * 100) : 100;
            
            const dayName = formatDayName(d);
            const dayNum = d.getUTCDate();
            
            results.push({
                label: `${dayName} ${dayNum}`,
                valor
            });
        }
        return results;
    };

    return {
        semana: getTrendForDays(7),
        quincena: getTrendForDays(15),
        mes: getTrendForDays(30)
    };
}

function generarAlertas(
    deptStats: { departamento: string; cumplimiento: number }[],
    shiftStats: { turno: string; retrasos: number; tasa: number }[],
    puntuales: number,
    retrasos: number
) {
    const alertas: { tipo: 'warning' | 'info' | 'success'; titulo: string; mensaje: string }[] = [];

    const peorDepto = deptStats.filter(d => d.cumplimiento < 80).sort((a, b) => a.cumplimiento - b.cumplimiento)[0];
    if (peorDepto)
        alertas.push({ tipo: 'warning', titulo: peorDepto.departamento, mensaje: `tiene un cumplimiento del ${peorDepto.cumplimiento}% hoy` });

    const peorTurno = shiftStats.filter(s => s.tasa > 20).sort((a, b) => b.tasa - a.tasa)[0];
    if (peorTurno)
        alertas.push({ tipo: 'warning', titulo: `Turno ${peorTurno.turno}`, mensaje: `tiene ${peorTurno.retrasos} retrasos (${peorTurno.tasa}%)` });

    const cumpl = (puntuales + retrasos) > 0 ? Math.round((puntuales / (puntuales + retrasos)) * 100) : 0;
    if (cumpl >= 85)
        alertas.push({ tipo: 'success', titulo: 'Cumplimiento general', mensaje: `está en ${cumpl}%, por encima de la meta` });
    else if (cumpl > 0)
        alertas.push({ tipo: 'info', titulo: 'Cumplimiento general', mensaje: `está en ${cumpl}%, por debajo de la meta del 85%` });

    if (alertas.length === 0)
        alertas.push({ tipo: 'info', titulo: 'Sistema', mensaje: 'No hay alertas activas en este momento' });

    return alertas;
}
