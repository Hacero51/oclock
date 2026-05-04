
const { PrismaClient } = require("./lib/generated/prisma/client");
const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    const totalEperson = await prisma.eperson.count();
    const totalEmployee = await prisma.employee.count();
    const totalPersonnel = await prisma.personnel_employee.count();
    
    console.log(`\n--- Estado de Tablas ---`);
    console.log(`Total en eperson (Personas): ${totalEperson}`);
    console.log(`Total en employee (Empleados): ${totalEmployee}`);
    console.log(`Total en personnel_employee (Reloj): ${totalPersonnel}`);

    // Ver una muestra de employee para ver qué códigos tenemos
    const sample = await prisma.employee.findMany({ take: 5 });
    console.log(`\nMuestra de Employee codes:`, sample.map(s => ({ ac: s.AcNumber, oid: s.Oid })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
