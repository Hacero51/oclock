import prisma from './lib/prisma';

async function verify() {
    console.log("--- EPerson ---");
    const epersonCount = await prisma.eperson.count();
    const epersonSample = await prisma.eperson.findFirst();
    console.log(`Count: ${epersonCount}`);
    console.log("Sample:", JSON.stringify(epersonSample, null, 2));

    console.log("\n--- TimetableFixed ---");
    const tbfCount = await prisma.timetablefixed.count();
    const tbfSample = await prisma.timetablefixed.findFirst();
    console.log(`Count: ${tbfCount}`);
    console.log("Sample:", JSON.stringify(tbfSample, null, 2));
}

verify().catch(console.error).finally(() => prisma.$disconnect());
