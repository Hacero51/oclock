import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        // Obtener permisos/incapacidades reales de la base de datos
        const leaves = await prisma.att_leave.findMany({
            include: {
                personnel_employee: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: { start_time: 'desc' },
            take: 100 // Limite para rendimiento
        });

        // Obtener categorías para resolver nombres
        const categories = await prisma.att_leavecategory.findMany();
        const categoryMap = new Map(categories.map(c => [c.id, c.category_name]));

        const formatLocale = (d: Date | null) => {
            if (!d) return "N/A";
            const options: Intl.DateTimeFormatOptions = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            return d.toLocaleDateString('es-ES', options).toUpperCase();
        };

        const data = leaves.map(l => ({
            id: l.abstractexception_ptr_id.toString(),
            "Empleado": `${l.personnel_employee.first_name || ''} ${l.personnel_employee.last_name || ''}`.trim(),
            "Tipo": categoryMap.get(l.category) || `TIPO ${l.category}`,
            "Inicio": formatLocale(l.start_time),
            "Fin": formatLocale(l.end_time),
            "Pago": true, // Por defecto se asume con pago para la visualización legacy
        }));

        return NextResponse.json(data);

    } catch (error) {
        console.error("Error obteniendo permisos e incapacidades:", error);
        return NextResponse.json(
            { error: "Error obteniendo datos de la base de datos" },
            { status: 500 }
        );
    }
}
