const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Corrigiendo registros incorrectos de R48 en la base de datos ---');
  
  // 1. Obtener tipo de asistencia R48
  const r48Type = await prisma.attendancetype.findFirst({
    where: { CodeToExport: 'R48' }
  });
  
  if (!r48Type) {
    console.error('Error: No se encontró el tipo de asistencia R48.');
    return;
  }
  
  // 2. Obtener todos los detalles de asistencia que tengan R48 en el rango de mayo/junio 2026
  const details = await prisma.attendancedetail.findMany({
    where: { 
      AttendanceType: r48Type.Oid,
      Day: {
        gte: new Date('2026-05-01T00:00:00Z'),
        lte: new Date('2026-06-30T00:00:00Z')
      }
    }
  });

  console.log(`Evaluando ${details.length} detalles de R48...`);
  
  let deletedCount = 0;
  const employeeCache = new Map();

  for (const d of details) {
    if (!d.Employee || !d.Day) continue;

    let empData = employeeCache.get(d.Employee);
    if (!empData) {
      const employee = await prisma.employee.findUnique({
        where: { Oid: d.Employee }
      });
      
      const party = await prisma.eparty.findUnique({
        where: { Oid: d.Employee },
        select: { CreatedDate: true, GCRecord: true }
      });
      const hireDate = (party && party.GCRecord === null) ? party.CreatedDate : null;

      const lastMarking = await prisma.marking.findFirst({
        where: { Employee: d.Employee },
        orderBy: { Day: 'desc' }
      });

      empData = {
        status: employee?.Status,
        hireDate,
        lastMarkingDay: lastMarking?.Day || null
      };
      employeeCache.set(d.Employee, empData);
    }

    const startOfDayDB = new Date(d.Day);
    startOfDayDB.setUTCHours(0, 0, 0, 0);

    let isWorkingPeriod = true;

    let normalizedHireDate = null;
    if (empData.hireDate) {
        normalizedHireDate = new Date(empData.hireDate);
        normalizedHireDate.setUTCHours(0, 0, 0, 0);
    }

    let lastMarkingDay = null;
    if (empData.lastMarkingDay) {
        lastMarkingDay = new Date(empData.lastMarkingDay);
        lastMarkingDay.setUTCHours(0, 0, 0, 0);
    }

    const afterHire = !normalizedHireDate || startOfDayDB >= normalizedHireDate;
    
    if (!afterHire) {
        isWorkingPeriod = false;
    } else {
        if (empData.status === 0) {
            if (lastMarkingDay) {
                const diffDays = (startOfDayDB.getTime() - lastMarkingDay.getTime()) / (1000 * 3600 * 24);
                if (diffDays > 8) {
                    isWorkingPeriod = false;
                }
            }
        } else {
            if (!lastMarkingDay || startOfDayDB > lastMarkingDay) {
                isWorkingPeriod = false;
            }
        }
    }

    if (!isWorkingPeriod) {
      // Eliminar el detalle de asistencia incorrecto de la base de datos
      await prisma.attendancedetail.delete({
        where: { Oid: d.Oid }
      });
      deletedCount++;
    }
  }

  console.log(`¡Listo! Se eliminaron ${deletedCount} registros incorrectos de R48.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
