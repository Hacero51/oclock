
const { PrismaClient } = require("./lib/generated/prisma/client");
const prisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:Iones1928.@localhost:3307/test_reloj2" } }
});

async function main() {
    console.log("--- Listado de Empleados en personnel_employee (Reloj) ---");
    const personnel = await prisma.personnel_employee.findMany({
        take: 10,
        select: {
            id: true,
            first_name: true,
            last_name: true,
            emp_code: true
        }
    });

    if (personnel.length === 0) {
        console.log("LA TABLA ESTÁ TOTALMENTE VACÍA.");
    } else {
        personnel.forEach(p => {
            console.log(`ID: ${p.id} | Código: ${p.emp_code} | Nombre: ${p.first_name} ${p.last_name}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
