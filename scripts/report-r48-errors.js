const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Buscando registros incorrectos de R48 (Ausencias injustificadas antes de ingreso) ---');
  
  // 1. Obtener tipo de asistencia R48
  const r48Type = await prisma.attendancetype.findFirst({
    where: { CodeToExport: 'R48' }
  });
  
  if (!r48Type) {
    console.error('Error: No se encontró el tipo de asistencia R48.');
    return;
  }
  
  // 2. Obtener todos los detalles de asistencia que tengan R48
  const details = await prisma.attendancedetail.findMany({
    where: { AttendanceType: r48Type.Oid, Hours: { gt: 0 } },
    select: {
      Oid: true,
      Employee: true,
      Day: true,
      Hours: true
    },
    orderBy: { Day: 'asc' }
  });

  console.log(`Se encontraron ${details.length} registros de R48 en total. Evaluando fechas de ingreso...`);
  const errorEntries = [];

  // Cache para evitar consultas repetitivas del mismo empleado
  const employeeCache = new Map();

  for (const d of details) {
    if (!d.Employee || !d.Day) continue;

    let empData = employeeCache.get(d.Employee);
    if (!empData) {
      // Buscar primer contrato activo (GCRecord IS NULL)
      const firstAgreement = await prisma.agreement.findFirst({
        where: { Employee: d.Employee, GCRecord: null },
        orderBy: { StartDate: 'asc' }
      });

      let hireDate = firstAgreement?.StartDate || null;
      let source = 'Contrato (Agreement.StartDate)';

      if (!hireDate) {
        // Fallback al eparty activo
        const party = await prisma.eparty.findUnique({
          where: { Oid: d.Employee },
          select: { CreatedDate: true, GCRecord: true }
        });
        hireDate = (party && party.GCRecord === null) ? party.CreatedDate : null;
        source = 'Creación (eParty.CreatedDate)';
      }

      // Si aún no hay fecha de ingreso, buscaremos el nombre del empleado
      const person = await prisma.eperson.findUnique({
        where: { Oid: d.Employee },
        select: { Document: true, FirstName: true, LastName: true }
      });

      empData = {
        hireDate,
        source,
        document: person?.Document || 'Desconocido',
        name: person ? `${person.FirstName} ${person.LastName}`.trim() : 'Desconocido'
      };
      employeeCache.set(d.Employee, empData);
    }

    if (empData.hireDate) {
      const normalizedHire = new Date(empData.hireDate);
      normalizedHire.setUTCHours(0, 0, 0, 0);

      const normalizedDay = new Date(d.Day);
      normalizedDay.setUTCHours(0, 0, 0, 0);

      if (normalizedDay < normalizedHire) {
        errorEntries.push({
          document: empData.document,
          name: empData.name,
          dateWithR48: normalizedDay.toISOString().split('T')[0],
          hours: d.Hours,
          hireDate: normalizedHire.toISOString().split('T')[0],
          source: empData.source
        });
      }
    } else {
      // Si el empleado no tiene fecha de ingreso (ambos nulos) y le marcó R48, también es un error
      errorEntries.push({
        document: empData.document,
        name: empData.name,
        dateWithR48: new Date(d.Day).toISOString().split('T')[0],
        hours: d.Hours,
        hireDate: 'Sin registrar',
        source: 'Nulo'
      });
    }
  }

  if (errorEntries.length === 0) {
    console.log('\n¡Excelente! No se encontraron empleados con R48 antes de su ingreso.');
  } else {
    console.log(`\nSe encontraron ${errorEntries.length} errores:`);
    console.table(errorEntries);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
