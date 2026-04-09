import prisma from './lib/prisma';

async function checkData() {
    console.log("--- Attendance Types (Full) ---");
    const types = await prisma.attendancetype.findMany();
    console.log(JSON.stringify(types, null, 2));

    console.log("\n--- Holiday Table (Full) ---");
    const holidays = await prisma.holiday.findMany();
    console.log(holidays.map(h => ({ name: h.Name, day: h.Day })));
}

checkData().catch(console.error).finally(() => prisma.$disconnect());
