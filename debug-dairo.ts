
// @ts-nocheck
import { PrismaClient } from "./lib/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
    console.log("Investigating Dairo Esteban...");

    // 1. Find Employee
    const employees = await prisma.employee.findMany({
        where: {
            OR: [
                { FirstName: { contains: 'DAIRO' } },
                { LastName: { contains: 'DAIRO' } },
                { FirstName: { contains: 'ESTEBAN' } }
            ]
        }
    });

    console.log(`Found ${employees.length} employees matching Dairo/Esteban.`);

    for (const emp of employees) {
        console.log(`Checking Emp: ${emp.FirstName} ${emp.LastName} (Oid: ${emp.Oid})`);

        // 2. Check Markings today (Dec 24)
        const startDay = new Date("2025-12-24T00:00:00Z");
        const endDay = new Date("2025-12-25T00:00:00Z");

        const markings = await prisma.marking.findMany({
            where: {
                Employee: emp.Oid,
                Day: {
                    gte: startDay,
                    lt: endDay
                }
            }
        });
        console.log(`  Markings today: ${markings.length}`);
        markings.forEach(m => console.log(`    MarkingIn: ${m.MarkingIn}, Status: ${m.Status}`));

        // 3. Check CheckInOut (Legacy)
        const checks = await prisma.checkinout.findMany({
            where: {
                Employee: emp.Oid,
                CheckTime: {
                    gte: startDay,
                    lt: endDay
                }
            },
            orderBy: { CheckTime: 'asc' }
        });
        console.log(`  CheckInOuts today: ${checks.length}`);
        checks.forEach(c => console.log(`    Time: ${c.CheckTime}, Type: ${c.CheckType}, Dev: ${c.Machine}`));

        // 4. Check Iclock (ADMS) via Pin match?
        // Typically pinned via AcNumber inside Emp
        if (emp.AcNumber) {
            // Need to find personnel_employee with this code
            const pEmp = await prisma.personnel_employee.findFirst({
                where: { emp_code: String(emp.AcNumber) }
            });
            if (pEmp) {
                // Find transactions
                const txs = await prisma.iclock_transaction.findMany({
                    where: {
                        emp_code: pEmp.emp_code,
                        punch_time: {
                            gte: startDay,
                            lt: endDay
                        }
                    }
                });
                console.log(`  ADMS Txs today: ${txs.length}`);
                txs.forEach(t => console.log(`    Time: ${t.punch_time}, State: ${t.punch_state}`));
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
