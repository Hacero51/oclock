const { PrismaClient } = require('./lib/generated/prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.euser.findFirst({ where: { UserName: 'ADMINISTRADOR' } });
  console.log('User:', user?.UserName);
  const roles = await prisma.euserusers_eroleroles.findMany({ where: { Users: user?.Oid } });
  const roleOids = roles.map(r => r.Roles);
  const rolesData = await prisma.rolebase.findMany({ where: { Oid: { in: roleOids } } });
  console.log('Roles:', rolesData.map(r => r.Name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
