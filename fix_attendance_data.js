
const { PrismaClient } = require("./lib/generated/prisma/client");

const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    const toFix = [
        { 
            first_name: "ESTEBAN DAVID", 
            last_name: "MERCADO", 
            emp_code: "1209", // Using the code they mark with
            document: "1004501848"
        },
        { 
            first_name: "STEVEN ALFONSO", 
            last_name: "ORTIZ DUARTE", 
            emp_code: "1143", // Using the code they mark with
            document: "1093734045"
        }
    ];

    console.log("--- Starting Data Repair for Missing Personnel Employees ---");

    for (const emp of toFix) {
        // Check if already exists (just in case)
        const existing = await prisma.personnel_employee.findFirst({
            where: { emp_code: emp.emp_code }
        });

        if (existing) {
            console.log(`[SKIP] Record for ${emp.first_name} already exists with code ${emp.emp_code}`);
            continue;
        }

        // Insert into personnel_employee
        // Note: We need to match the schema. Most fields have defaults.
        const created = await prisma.personnel_employee.create({
            data: {
                first_name: emp.first_name,
                last_name: emp.last_name,
                emp_code: emp.emp_code, // This is what matches iclock_transaction
                enable_attendance: true,
                is_admin: false,
                // We don't necessarily need to link to eperson here for the biometric engine to work,
                // but for our app to show it, we might need a common identifier.
                // In this system, the sync_all_data script usually matches by emp_code.
            }
        });

        console.log(`[FIXED] Created personnel_employee record for ${emp.first_name} ${emp.last_name} with code ${emp.emp_code}`);
    }

    console.log("--- Repair Complete. Please run sync_all_data.ts to reflect changes ---");
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); });
