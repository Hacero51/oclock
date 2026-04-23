import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        const activeShiftOids = activeShifts.map(s => s.Oid);

        // 2. Métricas base: totalEmpleados, marcaciones del período, empleados por depto
        const [totalEmpleados, marcacionesPeriodo] = await Promise.all([
            prisma.employee.count(),
            prisma.marking.count({ where: { Day: { gte: startDate, lte: todayLiteral } } })
        ]);

        // 3. Marcaciones de HOY con MarkingIn para puntualidad
        const marcacionesHoy = await prisma.marking.findMany({
            where: { Day: todayLiteral },
            select: { MarkingIn: true, Employee: true, Shift: true }
        });

        // 4. Departamentos (para cumplimiento por depto)
        const departamentos = await prisma.department.findMany({
            where: { GCRecord: null },
            select: { Oid: true, Name: true }
        });
        // Note: department HAS GCRecord, employee does NOT
        const deptNameMap = new Map(departamentos.map(d => [d.Oid, d.Name || 'Sin Nombre']));

        // 5. Empleados que marcaron hoy con su depto y turno
        const empOidsHoy = marcacionesHoy.map(m => m.Employee).filter((e): e is string => !!e);
        const empsHoy = await prisma.employee.findMany({
            where: { Oid: { in: empOidsHoy } },
            select: { Oid: true, CurrentShift: true, Department: true }
        });
        const empDataMap = new Map(empsHoy.map(e => [e.Oid, e]));

        // 6. Total empleados por turno activo
        const totalEmpsPerShift = await prisma.employee.groupBy({
            by: ['CurrentShift'],
            _count: { Oid: true },
            where: { CurrentShift: { in: activeShiftOids } }
        });

        // 7. Calcular puntualidad (umbral fijo 06:15 UTC = 375 min)
        // Bogotá = UTC-5, entonces 06:15 local = 11:15 UTC = 675 min
        // Los datos en DB están en hora local guardada como UTC => usar 375 min
        const LATE_THRESHOLD = 375; // 06:15 AM en minutos

        const shiftStats = new Map<string, { late: number; onTime: number; total: number }>();
        activeShifts.forEach(s => shiftStats.set(s.Oid, { late: 0, onTime: 0, total: 0 }));
        totalEmpsPerShift.forEach(g => {
            if (g.CurrentShift && shiftStats.has(g.CurrentShift))
                shiftStats.get(g.CurrentShift)!.total = g._count.Oid;
        });

        const deptPunct = new Map<string, { onTime: number; late: number }>();
        let totalPuntuales = 0;
        let totalRetrasos = 0;

        for (const m of marcacionesHoy) {
            if (!m.MarkingIn || !m.Employee) continue;
            const empData = empDataMap.get(m.Employee);
            const shiftOid = m.Shift || empData?.CurrentShift;

            const mins = m.MarkingIn.getUTCHours() * 60 + m.MarkingIn.getUTCMinutes();
            const isLate = mins > LATE_THRESHOLD;

            if (isLate) totalRetrasos++; else totalPuntuales++;

            if (shiftOid && shiftStats.has(shiftOid)) {
                if (isLate) shiftStats.get(shiftOid)!.late++;
                else shiftStats.get(shiftOid)!.onTime++;
            }

            if (empData?.Department) {
                if (!deptPunct.has(empData.Department))
                    deptPunct.set(empData.Department, { onTime: 0, late: 0 });
                const dp = deptPunct.get(empData.Department)!;
                if (isLate) dp.late++; else dp.onTime++;
            }
        }

        // 8. Retrasos por turno
        const retrasosPorTurno = activeShifts.map(s => {
            const st = shiftStats.get(s.Oid)!;
            return {
                turno: s.Name || 'Sin Nombre',
                retrasos: st.late,
                total: st.total || 1,
                tasa: Math.round((st.late / (st.total || 1)) * 100)
            };
        }).filter(s => s.total > 1).sort((a, b) => b.retrasos - a.retrasos).slice(0, 5);

        // 9. Cumplimiento REAL por departamento
        const deptEmpCount = await prisma.employee.groupBy({
            by: ['Department'],
            _count: { Oid: true },
            where: { Department: { not: null } }
        });

        const cumplimientoPorDepartamento = deptEmpCount
            .filter(r => r.Department && deptNameMap.has(r.Department))
            .map(r => {
                const dp = deptPunct.get(r.Department!) || { onTime: 0, late: 0 };
                const tot = dp.onTime + dp.late;
                return {
                    departamento: deptNameMap.get(r.Department!) || 'Sin Nombre',
                    cumplimiento: tot > 0 ? Math.round((dp.onTime / tot) * 100) : 100,
                    empleados: r._count.Oid
                };
            })
            .filter(d => d.empleados > 2)
            .sort((a, b) => b.empleados - a.empleados)
            .slice(0, 6);

        // 10. Tendencia real según período
        const tendencia = await calcularTendencia(period, startDate, todayLiteral, LATE_THRESHOLD);

        // 11. Alertas dinámicas
        const alertas = generarAlertas(cumplimientoPorDepartamento, retrasosPorTurno, totalPuntuales, totalRetrasos);

        // 12. Ausentes reales (empleados con turno que no marcaron hoy)
        const empleadosConTurno = await prisma.employee.count({
            where: { CurrentShift: { in: activeShiftOids } }
        });
        const ausentesHoy = Math.max(0, empleadosConTurno - marcacionesHoy.length);

        // 13. Incidencias del mes (marcaciones sin salida)
        const incidenciasMes = await prisma.marking.count({
            where: {
                Day: { gte: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)), lt: todayLiteral },
                MarkingOut: null
            }
        });

        return NextResponse.json({
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
            alertas
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Error al calcular estadísticas", detail: String(error) }, { status: 500 });
    }
}

async function calcularTendencia(
    period: string,
    startDate: Date,
    todayLiteral: Date,
    lateThreshold: number
) {
    if (period === 'today') {
        const labels = ['06AM', '08AM', '10AM', '12PM', '02PM', '04PM'];
        const marcaciones = await prisma.marking.findMany({
            where: { Day: todayLiteral },
            select: { MarkingIn: true }
        });
        return labels.map(label => {
            const h = parseInt(label);
            const hour = label.includes('PM') && h !== 12 ? h + 12 : h;
            const count = marcaciones.filter(m => m.MarkingIn && m.MarkingIn.getUTCHours() <= hour).length;
            return { label, valor: marcaciones.length > 0 ? Math.round((count / marcaciones.length) * 100) : 0 };
        });
    }

    if (period === 'week') {
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const results = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setUTCDate(day.getUTCDate() + i);
            if (day > todayLiteral) { results.push({ label: labels[i], valor: 0 }); continue; }
            const marks = await prisma.marking.findMany({
                where: { Day: day }, select: { MarkingIn: true }
            });
            const onTime = marks.filter(m => m.MarkingIn &&
                (m.MarkingIn.getUTCHours() * 60 + m.MarkingIn.getUTCMinutes()) <= lateThreshold
            ).length;
            results.push({ label: labels[i], valor: marks.length > 0 ? Math.round((onTime / marks.length) * 100) : 0 });
        }
        return results;
    }

    // month: 4 semanas
    const results = [];
    for (let w = 0; w < 4; w++) {
        const ws = new Date(startDate); ws.setUTCDate(ws.getUTCDate() + w * 7);
        const we = new Date(ws); we.setUTCDate(we.getUTCDate() + 6);
        if (ws > todayLiteral) { results.push({ label: `Sem ${w + 1}`, valor: 0 }); continue; }
        const marks = await prisma.marking.findMany({
            where: { Day: { gte: ws, lte: we > todayLiteral ? todayLiteral : we } },
            select: { MarkingIn: true }
        });
        const onTime = marks.filter(m => m.MarkingIn &&
            (m.MarkingIn.getUTCHours() * 60 + m.MarkingIn.getUTCMinutes()) <= lateThreshold
        ).length;
        results.push({ label: `Sem ${w + 1}`, valor: marks.length > 0 ? Math.round((onTime / marks.length) * 100) : 0 });
    }
    return results;
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
