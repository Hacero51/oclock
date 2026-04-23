import prisma from "../lib/prisma";

async function main() {
    console.log("Starting Duplicate Employee Cleanup and Data Consolidation...");

    // 1. Get all employees
    const emps = await prisma.employee.findMany();
    const groups: { [key: number]: any[] } = {};
    
    for (const e of emps) {
        if (!groups[e.AcNumber]) groups[e.AcNumber] = [];
        groups[e.AcNumber].push(e);
    }

    const dupGroups = Object.values(groups).filter(g => g.length > 1);
    console.log(`Found ${dupGroups.length} AcNumbers with duplicates.`);

    for (const group of dupGroups) {
        const acNumber = group[0].AcNumber;
        console.log(`\nProcessing AcNumber: ${acNumber}`);

        // Identify Master (the one with Shift or Department or more fields)
        // Sort by priority: has Shift > has Dept > has Branch > Oid (to be deterministic)
        const sorted = [...group].sort((a, b) => {
            const scoreA = (a.CurrentShift ? 10 : 0) + (a.Department ? 5 : 0) + (a.Branch ? 2 : 0);
            const scoreB = (b.CurrentShift ? 10 : 0) + (b.Department ? 5 : 0) + (b.Branch ? 2 : 0);
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.Oid.localeCompare(b.Oid);
        });

        const master = sorted[0];
        const duplicates = sorted.slice(1);

        console.log(`  Master Oid: ${master.Oid} (Shift: ${master.CurrentShift ? 'YES' : 'NO'})`);
        
        for (const dup of duplicates) {
            console.log(`  - Moving data from Duplicate Oid: ${dup.Oid}...`);

            // Move checkinout
            const checkUpdate = await prisma.checkinout.updateMany({
                where: { Employee: dup.Oid },
                data: { Employee: master.Oid }
            });
            if (checkUpdate.count > 0) console.log(`    Moved ${checkUpdate.count} checks.`);

            // Move marking
            // Note: This is tricky if both have markings for the same day.
            // We'll move them, and if there's a conflict, we'll try to merge them later.
            const dupMarkings = await prisma.marking.findMany({ where: { Employee: dup.Oid } });
            for (const dm of dupMarkings) {
                // Check if master already has a marking for this day
                const masterMarking = await prisma.marking.findFirst({
                    where: { Employee: master.Oid, Day: dm.Day }
                });

                if (!masterMarking) {
                    // No conflict, just move it
                    await prisma.marking.update({
                        where: { Oid: dm.Oid },
                        data: { Employee: master.Oid }
                    });
                } else {
                    // CONFLICT: Both have markings for the same day.
                    // Merge them: take the best In and best Out.
                    const bestIn = (dm.MarkingIn && (!masterMarking.MarkingIn || dm.MarkingIn < masterMarking.MarkingIn)) ? dm.MarkingIn : masterMarking.MarkingIn;
                    const bestOut = (dm.MarkingOut && (!masterMarking.MarkingOut || dm.MarkingOut > masterMarking.MarkingOut)) ? dm.MarkingOut : masterMarking.MarkingOut;
                    
                    await prisma.marking.update({
                        where: { Oid: masterMarking.Oid },
                        data: { 
                            MarkingIn: bestIn, 
                            MarkingOut: bestOut,
                            Status: (bestIn && bestOut) ? 0 : 1 // 0 = OK, 1 = Incomplete
                        }
                    });
                    
                    // Delete the duplicate marking
                    await prisma.marking.delete({ where: { Oid: dm.Oid } });
                    console.log(`    Merged marking for day ${dm.Day.toISOString().split('T')[0]}`);
                }
            }

            // Finally, delete the duplicate employee (and its eperson/eparty)
            // But wait, some other tables might refer to it.
            // For now, let's just mark it or leave it, but removing them is cleaner.
            // To be safe, we'll just remove them from the 'employee' table first.
            try {
                await prisma.employee.delete({ where: { Oid: dup.Oid } });
                // We leave eperson/eparty for now to avoid FK issues with other tables we might have missed.
                console.log(`    Deleted duplicate employee record.`);
            } catch (e: any) {
                console.error(`    Error deleting employee ${dup.Oid}: ${e.message}`);
            }
        }
    }

    console.log("\nConsolidation completed.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
