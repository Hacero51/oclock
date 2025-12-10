import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Consultamos la tabla base_adminlog
        // Intentamos obtener el usuario relacionado si es posible
        const logs = await prisma.base_adminlog.findMany({
            skip,
            take: limit,
            orderBy: {
                id: "desc" // Asumimos ID autoincremental como proxy de tiempo
            },
            include: {
                auth_user: {
                    select: {
                        username: true,
                        id: true
                    }
                }
            }
        });

        const total = await prisma.base_adminlog.count();

        // Normalizamos los datos para el frontend
        const data = logs.map(log => ({
            id: log.id,
            action: log.action,
            target: log.targets_repr || log.targets || "N/A",
            user: log.auth_user?.username || `User ID: ${log.user_id}`,
            // Como no vimos action_time en el snippet, no lo inventamos, pero si existe en schema real lo incluiría
            // Si no hay fecha, el ID nos dice el orden relativo
        }));

        return NextResponse.json({
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching admin logs:", error);
        return NextResponse.json(
            { error: "Error obteniendo logs" },
            { status: 500 }
        );
    }
}
