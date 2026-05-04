
const { PrismaClient } = require("./lib/generated/prisma/client");

const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    const names = [
        "ESTEBAN DAVID MERCADO",
        "STEVEN ALFONSO ORTIZ DUARTE"
    ];

    for (const name of names) {
        console.log(`\n--- Diagnosing: ${name} ---`);
        
        try {
            // 1. Find in eperson
            const eperson = await prisma.eperson.findFirst({
                where: {
                    FullName: { contains: name }
                }
            });

            if (!eperson) {
                console.log(`[ERROR] Eperson not found for ${name}`);
                continue;
            }
            console.log(`[OK] Eperson found: Oid=${eperson.Oid}, Document=${eperson.Document}, FullName=${eperson.FullName}`);

            // 2. Find in employee
            const employee = await prisma.employee.findUnique({
                where: { Oid: eperson.Oid }
            });

            if (!employee) {
                console.log(`[ERROR] Employee record not found for Oid=${eperson.Oid}`);
                continue;
            }
            console.log(`[OK] Employee found: Oid=${employee.Oid}, AcNumber=${employee.AcNumber}`);

            // 3. Find in personnel_employee
            // Note: In some schemas it might be 'personnel_employee', let's check prisma.personnel_employee
            const pEmployee = await prisma.personnel_employee.findFirst({
                where: {
                    OR: [
                        { emp_code: eperson.Document },
                        { first_name: { contains: eperson.FirstName || eperson.FullName.split(' ')[0] } }
                    ]
                }
            });

            if (!pEmployee) {
                console.log(`[MISSING] personnel_employee record NOT FOUND for ${name}`);
                
                // Try to find ANY personnel_employee by code
                const byCode = await prisma.personnel_employee.findFirst({
                    where: { emp_code: eperson.Document }
                });
                
                if (byCode) {
                    console.log(`[HINT] Found personnel_employee by code: ID=${byCode.id}, Name=${byCode.first_name} ${byCode.last_name}`);
                } else {
                    console.log(`[CRITICAL] No personnel_employee found by code ${eperson.Document} either.`);
                    
                    // Let's check iclock_transaction to see if they HAVE transactions
                    const transactions = await prisma.iclock_transaction.findMany({
                        where: { emp_code: eperson.Document },
                        take: 5
                    });
                    
                    if (transactions.length > 0) {
                        console.log(`[INFO] Found ${transactions.length} transactions in iclock_transaction for code ${eperson.Document}`);
                    } else {
                        console.log(`[WARN] No transactions found for code ${eperson.Document}`);
                    }
                }
            } else {
                console.log(`[OK] personnel_employee found: ID=${pEmployee.id}, Code=${pEmployee.emp_code}`);
            }
        } catch (err) {
            console.error(`Error processing ${name}:`, err);
        }
    }
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); });
