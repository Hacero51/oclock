import prisma from './lib/prisma';

async function checkData() {
    const types = await prisma.attendancetype.findMany();
    // Filter types that have the factors we are looking for
    const targets = [1.8, 2.15, 2.05, 2.55, 1.0, 1.35, 1.25, 1.75];
    console.log("--- Candidate Attendance Types ---");
    types.forEach(t => {
        if (t.Factor && targets.some(target => Math.abs(t.Factor - target) < 0.01)) {
            console.log(`Oid: ${t.Oid}, Code: ${t.CodeToExport}, Factor: ${t.Factor}`);
        }
    });

    console.log("\n--- Checking 2026 holidays ---");
    const holidays2026 = await prisma.holiday.findMany({
        where: {
            Day: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        }
    });
    console.log(holidays2026.map(h => ({ name: h.Name, day: h.Day })));
}

checkData().catch(console.error).finally(() => prisma.$disconnect());
