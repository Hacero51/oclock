import prisma from './lib/prisma';

async function checkData() {
    console.log("--- Attendance Types ---");
    const types = await prisma.attendancetype.findMany();
    console.log(types.map(t => ({ oid: t.Oid, code: t.CodeToExport, factor: t.Factor })));

    console.log("\n--- Holidays ---");
    const holidays = await prisma.att_holiday.findMany();
    console.log(holidays.map(h => ({ alias: h.alias, start: h.start_date, duration: h.duration_day })));
}

checkData().catch(console.error).finally(() => prisma.$disconnect());
