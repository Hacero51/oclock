const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const oid = 'f3a702af-8176-4c1e-a6b9-827df5e4a4c0';
    try {
        console.log("Searching for machine with Oid:", oid);
        const machine = await prisma.machine.findUnique({
            where: { Oid: oid }
        });
        console.log("Machine found:", machine ? "Yes" : "No");
        if (machine) console.log("Machine Name:", machine.Name);

        const details = await prisma.machinezk.findUnique({
            where: { Oid: oid }
        });
        console.log("Details found:", details ? "Yes" : "No");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
