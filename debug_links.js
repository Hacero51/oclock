const { PrismaClient } = require('./lib/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- START ---');
    const h = await prisma.timetable.findFirst({
        where: {
            OR: [
                { DisplayName: { contains: '8 HORAS' } },
                { Name: { contains: '8 HORAS' } }
            ]
        }
    });

    if (h) {
        console.log('Horario Found:', h.DisplayName || h.Name);
        console.log('Oid:', h.Oid);

        // Check with direct Oid
        const links = await prisma.shifttimetable.findMany({
            where: { Timetable: { contains: h.Oid.trim() } }
        });
        console.log('Links for this Oid (contains):', links.length);

        const linksExact = await prisma.shifttimetable.findMany({
            where: { Timetable: h.Oid }
        });
        console.log('Links for this Oid (exact):', linksExact.length);

        linksExact.forEach(l => console.log(`  Shift: ${l.Shift}, Day: ${l.Day}`));

        if (linksExact.length === 0) {
            console.log('Checking all links to see if any match Oid structure...');
            const allLinks = await prisma.shifttimetable.findMany({ take: 20 });
            allLinks.forEach(l => {
                if (l.Timetable) {
                    console.log(`  Link Timetable: [${l.Timetable}] (${l.Timetable.length}) vs H Oid: [${h.Oid}] (${h.Oid.length})`);
                }
            });
        }

    } else {
        console.log('Horario "8 HORAS" not found');
        const allH = await prisma.timetable.findMany({ take: 5 });
        allH.forEach(hh => console.log('  Oid:', hh.Oid, 'Name:', hh.DisplayName));
    }
    console.log('--- END ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
