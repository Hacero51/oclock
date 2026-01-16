// @ts-nocheck
import { PrismaClient } from "./lib/generated/prisma/client.ts";

async function main() {
    const targetDateStr = "2025-12-23";
    const targetDay = new Date(Date.UTC(2025, 11, 23, 0, 0, 0, 0));

    console.log("Analyzing data for Hans Stacy on:", targetDateStr);

    const persons = await prisma.eperson.findMany({
        where: {
            OR: [
                { FirstName: { contains: "HANS STACY" } },
                { LastName: { contains: "HANS STACY" } }
            ]
        }
    });

    if (persons.length === 0) {
        console.log("No person found.");
        return;
    }

    const empOid = persons[0].Oid;
    console.log(`Found Person: ${persons[0].FirstName} (Oid: ${empOid})`);

    const markings = await prisma.marking.findMany({
        where: { Employee: empOid },
        orderBy: { Day: 'asc' }
    });

    console.log(`\nFound ${markings.length} total markings.`);
    markings.forEach(m => {
        const d = m.Day ? new Date(m.Day) : null;
        console.log(`Marking Oid: ${m.Oid} | Day: ${d ? d.toISOString() : 'NULL'} | In: ${m.MarkingIn ? new Date(m.MarkingIn).toISOString() : 'NULL'} | Out: ${m.MarkingOut ? new Date(m.MarkingOut).toISOString() : 'NULL'} | Status: ${m.Status}`);
    });

    const checks = await prisma.checkinout.findMany({
        where: {
            Employee: empOid,
            CheckTime: {
                gte: new Date("2025-12-22T00:00:00Z"),
                lte: new Date("2025-12-24T00:00:00Z")
            }
        },
        orderBy: { CheckTime: 'asc' }
    });

    console.log(`\nFound ${checks.length} checkinouts (Dec 22-24):`);
    checks.forEach(c => {
        console.log(`Check Oid: ${c.Oid} | Time: ${c.CheckTime?.toISOString()} | Type: ${c.CheckType}`);
    });
}

main().finally(async () => {
    await prisma.$disconnect();
});
