
const { PrismaClient } = require('./lib/generated/prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function reprocessToday() {
    console.log("Iniciando reprocesamiento de registros de HOY...");

    // 1. Definir rango de HOY
    const startSearch = new Date();
    startSearch.setHours(0, 0, 0, 0);

    console.log(`Buscando registros desde: ${startSearch.toISOString()}`);

    const logsTransactions = await prisma.iclock_transaction.findMany({
        where: {
            punch_time: {
                gte: startSearch
            }
        },
        include: {
            personnel_employee: true
        },
        orderBy: { punch_time: 'asc' }
    });

    const logsCheckinout = await prisma.checkinout.findMany({
        where: {
            checktime: {
                gte: startSearch
            }
        },
        include: {
            userinfo: true
        },
        orderBy: { checktime: 'asc' }
    });

    console.log(`Encontrados: ${logsTransactions.length} transacciones ADMS, ${logsCheckinout.length} checkinout Legacy.`);

    // Función Helper para procesar
    const processLog = async (employeeId, timestamp) => {
        if (!employeeId) return;

        // Calcular Inicio de Día UTC (Igual que en sync.ts/adms.ts)
        const year = timestamp.getUTCFullYear();
        const month = timestamp.getUTCMonth();
        const day = timestamp.getUTCDate();
        const inicioDia = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

        // Buscar si ya existe Marking
        const existingMarking = await prisma.marking.findFirst({
            where: {
                Employee: employeeId,
                Day: inicioDia
            }
        });

        if (!existingMarking) {
            console.log(`[FIX] Creando Marking faltante para Emp ID ${employeeId} en ${timestamp.toISOString()}`);

            // Buscar empleado para turno/ciclo
            const emp = await prisma.employee.findUnique({ where: { Oid: employeeId } });

            await prisma.marking.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: employeeId,
                    Day: inicioDia,
                    MarkingIn: timestamp,
                    Shift: emp?.CurrentShift || null,
                    Cycle: emp?.CurrentCycle || null,
                    Status: 1,
                    StartShiftMarkingIn: false,
                    OverTimeBeforeEntry: false,
                    OverTimeAfterExit: false,
                    OverTimeInHoliday: false,
                    Approve: false
                }
            });
        }
    };

    // Procesar ADMS
    console.log("Procesando logs ADMS...");
    for (const tx of logsTransactions) {
        if (tx.personnel_employee?.emp_code) {
            const emp = await prisma.employee.findFirst({ where: { pin: tx.personnel_employee.emp_code } });
            if (emp) {
                await processLog(emp.Oid, tx.punch_time);
            }
        }
    }

    // Procesar Legacy (checkinout)
    console.log("Procesando logs Legacy...");
    for (const chk of logsCheckinout) {
        if (chk.userinfo?.badgenumber) {
            const emp = await prisma.employee.findFirst({ where: { pin: chk.userinfo.badgenumber } });
            if (emp) {
                await processLog(emp.Oid, chk.checktime);
            }
        }
    }

    console.log("Reprocesamiento completado.");
}

reprocessToday()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
