import prisma from './lib/prisma';

async function main() {
    const types = await prisma.attendancetype.findMany();
    console.log(JSON.stringify(types, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
