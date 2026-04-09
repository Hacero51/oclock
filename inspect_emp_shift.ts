import prisma from './lib/prisma';

async function checkEmployeeData() {
    const employee = await prisma.personnel_employee.findFirst({
        include: {
            att_attschedule: {
                include: {
                    att_attshift: {
                        include: {
                            att_shiftdetail: {
                                include: {
                                    att_timeinterval: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(employee, null, 2));
}

checkEmployeeData().catch(console.error).finally(() => prisma.$disconnect());
