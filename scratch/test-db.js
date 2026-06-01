const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("--- CONSULTANDO TURNOS DE LOS EMPLEADOS ---");
    const employees = await prisma.employee.findMany({
      select: { Oid: true, CurrentShift: true }
    });

    const uniqueShiftIds = [...new Set(employees.map(e => e.CurrentShift).filter(Boolean))];
    console.log("Unique Shift Oids assigned to employees:", uniqueShiftIds);

    const shifts = await prisma.shift.findMany({
      where: { Oid: { in: uniqueShiftIds } }
    });
    console.log("Assigned shift details:");
    shifts.forEach(s => {
      console.log(`- Oid: ${s.Oid} | Name: ${s.Name}`);
    });

    console.log("\n--- CONTANDO EMPLEADOS EN 'OFICINA' Y 'OFICINA - EXTRAS' ---");
    const oficinaCount = employees.filter(e => e.CurrentShift === '10952ec7-6a3a-4652-b09c-146555216adc').length;
    const oficinaExtrasCount = employees.filter(e => e.CurrentShift === '3f381b69-cee8-469a-9107-95db88e47470').length;
    console.log("Empleados en 'OFICINA' (Oid 10952ec7-6a3a-4652-b09c-146555216adc):", oficinaCount);
    console.log("Empleados en 'OFICINA - EXTRAS' (Oid 3f381b69-cee8-469a-9107-95db88e47470):", oficinaExtrasCount);
  } catch (error) {
    console.error("Error consultando empleados y turnos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
