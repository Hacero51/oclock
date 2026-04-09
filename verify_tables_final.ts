import prisma from './lib/prisma';

async function verifyTables() {
    const tableCounts = [
        { table: 'holiday', count: await prisma.holiday.count() },
        { table: 'att_holiday', count: await prisma.att_holiday.count() },
        { table: 'attendancetype', count: await prisma.attendancetype.count() },
        { table: 'personnel_payrollconcept', count: await prisma.personnel_payrollconcept.count() },
        { table: 'attendancedetail', count: await prisma.attendancedetail.count() },
        { table: 'marking', count: await prisma.marking.count() },
        { table: 'checkinout', count: await prisma.checkinout.count() },
        { table: 'att_attschedule', count: await prisma.att_attschedule.count() },
        { table: 'att_attshift', count: await prisma.att_attshift.count() },
        { table: 'personnel_employee', count: await prisma.personnel_employee.count() }
    ];
    console.table(tableCounts);

    const sampleTypes = await prisma.attendancetype.findMany({ take: 5 });
    console.log("\nEjemplo de Attendancetype:", sampleTypes.map(t => ({ oid: t.Oid, code: t.CodeToExport })));
}

verifyTables().catch(console.error).finally(() => prisma.$disconnect());
