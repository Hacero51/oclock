import prisma from './lib/prisma';

async function verifyTables() {
    const tableCounts = [
        { table: 'employee', count: await prisma.employee.count() },
        { table: 'personnel_employee', count: await prisma.personnel_employee.count() },
        { table: 'shift', count: await prisma.shift.count() },
        { table: 'att_attshift', count: await prisma.att_attshift.count() },
        { table: 'shifttimetable', count: await prisma.shifttimetable.count() },
        { table: 'attendancedetail', count: await prisma.attendancedetail.count() },
        { table: 'attendancetype', count: await prisma.attendancetype.count() },
        { table: 'holiday', count: await prisma.holiday.count() }
    ];
    console.table(tableCounts);
}

verifyTables().catch(console.error).finally(() => prisma.$disconnect());
