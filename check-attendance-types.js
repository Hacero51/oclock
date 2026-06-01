const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const types = await prisma.attendancetype.findMany();
  console.log('All Attendance Types:', JSON.stringify(types, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
