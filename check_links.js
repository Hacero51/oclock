const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    const h = await prisma.timetable.findFirst({
        where: { DisplayName: { contains: '8 HORAS' } }
    });
    if (!h) {
        console.log('Horario not found');
        return;
    }
    const links = await prisma.shifttimetable.findMany({
        where: { Timetable: h.Oid }
    });
    console.log('--- Horario Found ---');
    console.log('Name:', h.DisplayName);
    console.log('Oid:', h.Oid);
    console.log('Links count in shifttimetable:', links.length);
    links.forEach(l => {
        console.log(`Day: ${l.Day}, Shift Oid: ${l.Shift}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
