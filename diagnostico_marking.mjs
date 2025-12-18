
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.marking.count();
        console.log('Total registros en marking:', count);

        if (count > 0) {
            const lastRecords = await prisma.marking.findMany({
                take: 3,
                orderBy: {
                    Day: 'desc'
                }
            });
            console.log('Últimos 3 registros de marking:');
            console.dir(lastRecords, { depth: null });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
