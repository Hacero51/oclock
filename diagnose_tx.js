
const { PrismaClient } = require("./lib/generated/prisma/client");

const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    const employees = [
        { name: "ESTEBAN DAVID MERCADO", ac: "1209", doc: "1004501848" },
        { name: "STEVEN ALFONSO ORTIZ DUARTE", ac: "1143", doc: "1093734045" }
    ];

    for (const emp of employees) {
        console.log(`\n--- Searching Transactions for: ${emp.name} ---`);
        
        // Search by Document
        const txDoc = await prisma.iclock_transaction.findMany({
            where: { emp_code: emp.doc },
            take: 5,
            orderBy: { punch_time: 'desc' }
        });
        console.log(`Transactions by Document (${emp.doc}): ${txDoc.length}`);
        if (txDoc.length > 0) {
            console.log(`Last one: ${txDoc[0].punch_time}`);
        }

        // Search by AcNumber
        const txAc = await prisma.iclock_transaction.findMany({
            where: { emp_code: emp.ac },
            take: 5,
            orderBy: { punch_time: 'desc' }
        });
        console.log(`Transactions by AcNumber (${emp.ac}): ${txAc.length}`);
        if (txAc.length > 0) {
            console.log(`Last one: ${txAc[0].punch_time}`);
        }

        // Try to find ANY record in personnel_employee that might match by name partially
        const partialName = emp.name.split(' ')[0];
        const pEmps = await prisma.personnel_employee.findMany({
            where: {
                OR: [
                    { first_name: { contains: partialName } },
                    { last_name: { contains: partialName } }
                ]
            }
        });
        console.log(`Potential matches in personnel_employee for "${partialName}": ${pEmps.length}`);
        pEmps.forEach(p => {
            console.log(` - ID: ${p.id}, Code: ${p.emp_code}, Name: ${p.first_name} ${p.last_name}`);
        });
    }
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); });
