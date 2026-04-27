import prisma from '../lib/prisma';
import { laborEngine } from '../server/biometric/engine';

async function main() {
  console.log('--- RECALCULATION MOTOR: APRIL 2026 ---');
  
  // 1. Obtener todos los empleados que tienen marcaciones en abril
  const startDate = new Date(Date.UTC(2026, 3, 1)); // 1 de Abril
  const endDate = new Date(Date.UTC(2026, 3, 30, 23, 59, 59)); // 30 de Abril
  
  const employeesWithMarkings = await prisma.marking.findMany({
    where: {
      Day: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      Employee: true
    },
    distinct: ['Employee']
  });
  
  console.log(`Encontrados ${employeesWithMarkings.length} empleados con actividad en Abril.`);
  
  // 2. Para cada empleado, procesar todos los días de abril
  for (const item of employeesWithMarkings) {
    const employeeId = item.Employee;
    if (!employeeId) continue;
    
    console.log(`Procesando empleado: ${employeeId}...`);
    
    // Generamos cada día del 1 al 23 (hoy)
    for (let day = 1; day <= 23; day++) {
      const currentDay = new Date(Date.UTC(2026, 3, day));
      try {
        await laborEngine.processDay(employeeId, currentDay);
      } catch (error) {
        console.error(`Error procesando Emp ${employeeId} Día ${day}:`, error);
      }
    }
  }
  
  console.log('--- RECALCULATION FINISHED ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
