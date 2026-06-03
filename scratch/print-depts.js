const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany({
    select: {
      Oid: true,
      Name: true,
      FullName: true,
    }
  });
  console.log("DEPARTAMENTOS EN BD:");
  console.log(JSON.stringify(depts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
