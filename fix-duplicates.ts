
import { PrismaClient } from "./lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing Duplicate Markings (In == Out)...");

    // Range: Today (Dec 26 based on report, but checking recent days safely)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // From yesterday
    startDate.setHours(0, 0, 0, 0);

    const markings = await prisma.marking.findMany({
        where: {
            Day: { gte: startDate },
            MarkingOut: { not: null }
        }
    });

    console.log(`Checking ${markings.length} completed markings since ${startDate.toISOString()}`);

    let fixed = 0;
    for (const m of markings) {
        if (!m.MarkingIn || !m.MarkingOut) continue;

        const diffOrZero = Math.abs(m.MarkingIn.getTime() - m.MarkingOut.getTime());

        // If difference is less than 60 seconds, it's likely a self-close bug
        if (diffOrZero < 60000) {
            console.log(`Fixing Oid: ${m.Oid} | In: ${m.MarkingIn.toISOString()} | Out: ${m.MarkingOut.toISOString()} (Diff: ${diffOrZero}ms)`);

            await prisma.marking.update({
                where: { Oid: m.Oid },
                data: { MarkingOut: null }
            });
            fixed++;
        }
    }

    console.log(`Fixed ${fixed} records.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
