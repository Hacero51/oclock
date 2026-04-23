import { PrismaClient } from "../lib/generated/prisma/client";

const sourcePrisma = new PrismaClient({
    datasources: { db: { url: "mysql://stock:qscwdv@172.17.1.242:3306/reloj2" } }
});

const targetPrisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    console.log("Starting full master data sync from Production to Test...");

    // List of models to sync
    const models = [
        { name: 'department', label: 'Departments' },
        { name: 'branch', label: 'Branches' },
        { name: 'shift', label: 'Shifts' },
        { name: 'position', label: 'Positions' },
        { name: 'agreementtype', label: 'Agreement Types' },
        { name: 'costcenter', label: 'Cost Centers' }
    ];

    for (const m of models) {
        console.log(`\n--- Syncing ${m.label} ---`);
        const sourceData = await (sourcePrisma as any)[m.name].findMany();
        for (const item of sourceData) {
            await (targetPrisma as any)[m.name].upsert({
                where: { Oid: item.Oid },
                create: item,
                update: item
            });
        }
        console.log(`Synced ${sourceData.length} ${m.label.toLowerCase()}.`);
    }

    // Employees (Parties -> Persons -> Employees)
    console.log("\n--- Syncing Employees (Full Check) ---");
    const sEmps = await sourcePrisma.employee.findMany();
    console.log(`Total employees in source: ${sEmps.length}`);

    let migratedCount = 0;
    for (const emp of sEmps) {
        const exists = await targetPrisma.employee.findUnique({ where: { Oid: emp.Oid } });
        if (!exists) {
            const party = await sourcePrisma.eparty.findUnique({ where: { Oid: emp.Oid } });
            if (party) await targetPrisma.eparty.upsert({ where: { Oid: party.Oid }, create: party as any, update: party as any });

            const person = await sourcePrisma.eperson.findUnique({ where: { Oid: emp.Oid } });
            if (person) await targetPrisma.eperson.upsert({ where: { Oid: person.Oid }, create: person as any, update: person as any });

            await targetPrisma.employee.create({ data: emp as any });
            migratedCount++;
        }
    }
    console.log(`Migrated ${migratedCount} new employees.`);

    console.log("\nSync completed successfully.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await sourcePrisma.$disconnect();
        await targetPrisma.$disconnect();
    });
