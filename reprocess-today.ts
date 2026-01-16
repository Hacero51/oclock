
// @ts-nocheck
// Import directly from relative path to avoid alias issues in ts-node
// We use require to avoid some strict TS module checks if possible, or just standard import that worked for clean-transactions
import { PrismaClient } from './lib/generated/prisma/client';

const prisma = new PrismaClient();

async function reprocessToday() {
    console.log("Iniciando reprocesamiento de registros de HOY...");

    // 1. Definir rango de HOY
    const startSearch = new Date();
    startSearch.setHours(0, 0, 0, 0);

    console.log(`Buscando registros desde: ${startSearch.toISOString()}`);

    // Fetch ADMS Logs
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

    // Fetch Legacy CheckInOut Logs
    // Note: CheckInOut model has PascalCase fields: CheckTime, CheckType, Employee, etc.
    // It does NOT have a relation to 'userinfo' in the generated client based on previous errors.
    // However, it has 'Employee' field which is the ID.
    const logsCheckinout = await prisma.checkinout.findMany({
        where: {
            CheckTime: {
                gte: startSearch
            }
        },
        orderBy: { CheckTime: 'asc' }
    });

    console.log(`Encontrados: ${logsTransactions.length} transacciones ADMS, ${logsCheckinout.length} checkinout Legacy.`);

    // Función Helper para procesar
    const processLog = async (employeeId: number, timestamp: Date) => {
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

            // Logica "Primer Golpe = Entrada"
            await prisma.marking.create({
                data: {
                    Oid: crypto.randomUUID(),
                    Employee: employeeId,
                    Day: inicioDia,
                    MarkingIn: timestamp,
                    Shift: (emp as any)?.CurrentShift || null,
                    Cycle: (emp as any)?.CurrentCycle || null,
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
            // Asignamos emp_code a AcNumber (Int)
            const acNumber = parseInt(tx.personnel_employee.emp_code);
            if (!isNaN(acNumber)) {
                const emp = await prisma.employee.findFirst({ where: { AcNumber: acNumber } });
                if (emp) {
                    await processLog(emp.Oid, tx.punch_time);
                }
            }
        }
    }

    // Procesar Legacy (checkinout)
    console.log("Procesando logs Legacy...");
    for (const chk of logsCheckinout) {
        // chk.Employee es el ID del empleado directamente
        if (chk.Employee) {
            await processLog(chk.Employee, chk.CheckTime);
        }
    }

    console.log("Reprocesamiento completado.");
}

reprocessToday()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
