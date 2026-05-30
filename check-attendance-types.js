const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const types = await prisma.attendancetype.findMany({
    take: 10
  });
  console.log('Attendance Types:', JSON.stringify(types, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
