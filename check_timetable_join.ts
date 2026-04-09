import prisma from './lib/prisma';

async function checkIds() {
    const tt = await prisma.timetable.findFirst();
    const ttf = await prisma.timetablefixed.findUnique({ where: { Oid: tt.Oid } });
    console.log("Timetable ID:", tt.Oid);
    console.log("TimetableFixed ID:", ttf?.Oid);
    if (ttf) console.log("Match!");
}

checkIds().catch(console.error).finally(() => prisma.$disconnect());
