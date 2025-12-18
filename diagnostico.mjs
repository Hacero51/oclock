
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.att_payloadbase.count();
        console.log('Total registros en att_payloadbase:', count);

        if (count > 0) {
            const lastRecords = await prisma.att_payloadbase.findMany({
                take: 5,
                orderBy: {
                    att_date: 'desc'
                },
                include: {
                    personnel_employee: true
                }
            });
            console.log('Últimos 5 registros:');
            console.dir(lastRecords, { depth: null });
        } else {
            console.log('La tabla att_payloadbase está vacía.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
