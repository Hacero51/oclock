import { PrismaClient } from "../lib/generated/prisma/client";

const sourcePrisma = new PrismaClient({
    datasources: { db: { url: "mysql://stock:qscwdv@172.17.1.242:3306/reloj2" } }
});

const targetPrisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    console.log("Syncing missing markings and checkinout from Production to Test for April...");

    const startDate = new Date('2026-04-01');

    // 1. Sync checkinout
    console.log("\n--- Syncing Checkinout ---");
    const sChecks = await sourcePrisma.checkinout.findMany({
        where: { CheckTime: { gte: startDate } }
    });
    console.log(`Found ${sChecks.length} checks in source.`);
    
    let checksMigrated = 0;
    for (const check of sChecks) {
        const exists = await targetPrisma.checkinout.findUnique({ where: { Oid: check.Oid } });
        if (!exists) {
            await targetPrisma.checkinout.create({ data: check as any });
            checksMigrated++;
        }
    }
    console.log(`Migrated ${checksMigrated} new checks.`);

    // 2. Sync markings
    console.log("\n--- Syncing Markings ---");
    const sMarkings = await sourcePrisma.marking.findMany({
        where: { Day: { gte: startDate } }
    });
    console.log(`Found ${sMarkings.length} markings in source.`);

    let markingsMigrated = 0;
    let markingsUpdated = 0;
    for (const m of sMarkings) {
        const exists = await targetPrisma.marking.findUnique({ where: { Oid: m.Oid } });
        if (!exists) {
            // Check if there's a marking for the same employee and day but different Oid (prevent duplicates)
            const duplicate = await targetPrisma.marking.findFirst({
                where: { Employee: m.Employee, Day: m.Day }
            });
            
            if (!duplicate) {
                await targetPrisma.marking.create({ data: m as any });
                markingsMigrated++;
            } else {
                // If it exists with different Oid, maybe update the times if source is more complete?
                // For now, skip to avoid Oid conflicts.
            }
        } else {
            // Update if necessary (e.g. if source has MarkingOut but target doesn't)
            if (m.MarkingOut && !exists.MarkingOut) {
                await targetPrisma.marking.update({
                    where: { Oid: m.Oid },
                    data: { MarkingOut: m.MarkingOut }
                });
                markingsUpdated++;
            }
        }
    }
    console.log(`Migrated ${markingsMigrated} new markings, updated ${markingsUpdated}.`);

    console.log("\nSync completed.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await sourcePrisma.$disconnect();
        await targetPrisma.$disconnect();
    });
