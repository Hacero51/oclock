import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const machines = await prisma.machine.findMany({
            where: {
                MachineNumber: { in: [4, 91] },
                ConnectionStatus: 1
            },
            select: {
                Oid: true,
                Name: true,
                Status: true,
                ConnectionStatus: true,
                LastDownload: true,
                MachineNumber: true
            },
            orderBy: { Name: 'asc' }
        });
        const machineOids = machines.map(m => m.Oid);

        const details = await prisma.machinezk.findMany({
            where: { Oid: { in: machineOids } }
        });

        const data = machines.map(m => {
            const d = details.find(detail => detail.Oid === m.Oid);
            return {
                id: m.MachineNumber || m.Oid,
                oid: m.Oid,
                nombre: m.Name,
                ip: d?.IP || 'N/A',
                puerto: d?.Port || 4370,
                estado: m.ConnectionStatus === 1 ? 'Conectado' : 'Desconectado',
                ultimaDescarga: m.LastDownload ? m.LastDownload.toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }).toUpperCase() : 'NUNCA'
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error obteniendo dispositivos:", error);
        return NextResponse.json({ error: "Error obteniendo dispositivos" }, { status: 500 });
    }
}
