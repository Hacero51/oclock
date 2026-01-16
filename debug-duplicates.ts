
import prisma from "./lib/prisma.ts";

async function main() {
    const targetDateStr = "2025-12-23";
    // UTC Midnight for target date
    const targetDay = new Date(Date.UTC(2025, 11, 23, 0, 0, 0, 0));

    console.log("Analyzing data for Hans Stacy on:", targetDateStr);
    console.log("Target UTC Day:", targetDay.toISOString());

    // 1. Find Employee
    const employeeName = "HANS STACY";
    // Partial match search like route.ts
    const persons = await prisma.eperson.findMany({
        where: {
            OR: [
                { FirstName: { contains: employeeName } },
                { LastName: { contains: employeeName } }
            ]
        }
    });

    if (persons.length === 0) {
        console.log("No person found with name:", employeeName);
        return;
    }

    const empOid = persons[0].Oid;
    console.log(`Found Person: ${persons[0].FirstName} ${persons[0].LastName} (Oid: ${empOid})`);

    // 2. Fetch Markings
    // Get all markings for this employee around this date to see what's going on
    const markings = await prisma.marking.findMany({
        where: {
            Employee: empOid,
            // Day: targetDay // Let's simplify filter to see ALL nearby
        },
        orderBy: { Day: 'asc' }
    });

    console.log(`\nFound ${markings.length} total markings for this employee.`);

    markings.forEach(m => {
        if (m.Day) {
            const d = new Date(m.Day);
            // Check if it matches target day
            const isMatch = d.getTime() === targetDay.getTime();
            console.log(`Marking Oid: ${m.Oid} | Day: ${d.toISOString()} (Match: ${isMatch}) | In: ${m.MarkingIn?.toISOString()} | Out: ${m.MarkingOut?.toISOString()} | Shift: ${m.Shift} | Status: ${m.Status}`);
        } else {
            console.log(`Marking Oid: ${m.Oid} | Day: NULL`);
        }
    });

    // 3. Fetch CheckInOuts
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
        console.log(`Check Oid: ${c.Oid} | Time: ${c.CheckTime?.toISOString()} | Type: ${c.CheckType} | Verify: ${c.VerifyCode}`);
    });

    // 4. Test timestamps from user report
    const rawTimes = ["2025-12-23 01:41:00Z", "2025-12-23 11:56:00Z"]; // Assuming this is what sync logic did
    console.log("\nSimulating Sync Logic:");
    for (const tStr of rawTimes) {
        const normalizedTime = new Date(tStr);
        const year = normalizedTime.getUTCFullYear();
        const month = normalizedTime.getUTCMonth();
        const day = normalizedTime.getUTCDate();
        const inicioDia = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        console.log(`Input: ${tStr} -> Normalized: ${normalizedTime.toISOString()} -> InicioDia: ${inicioDia.toISOString()}`);
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
