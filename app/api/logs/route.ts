import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const logs = await prisma.base_adminlog.findMany({
            skip,
            take: limit,
            orderBy: { op_time: "desc" },
            include: {
                auth_user: {
                    select: { username: true }
                }
            }
        });

        const total = await prisma.base_adminlog.count();

        const actionMap: Record<string, string> = {
            'CREATE': 'CREACIÓN',
            'UPDATE': 'ACTUALIZACIÓN',
            'DELETE': 'ELIMINACIÓN',
            'REPORT': 'REPORTE',
            'LOGIN': 'INICIO SESIÓN'
        };

        const targetMap: Record<string, string> = {
            'employee': 'Empleado',
            'user': 'Usuario',
            'marking': 'Marcación',
            'shift': 'Turno',
            'timetable': 'Horario',
            'nomina-ofima': 'Reporte Nómina'
        };

        // Resolución de OIDs a nombres (Procesamiento en paralelo)
        const data = await Promise.all(logs.map(async (log) => {
            let actionStr = log.action || "OTRO";
            actionStr = actionMap[actionStr] || actionStr;

            let targetStr = log.targets_repr || "";
            let descriptionStr = log.description || "";

            // Función interna para resolver un OID a un nombre amigable
            const resolveOID = async (text: string): Promise<string> => {
                if (!text) return text;
                // Regex para detectar UUIDs (OIDs)
                const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
                const matches = text.match(uuidRegex);
                
                if (!matches) return text;

                let resolvedText = text;
                for (const oid of matches) {
                    // 1. Intentar buscar en empleados
                    const emp = await prisma.eperson.findUnique({ 
                        where: { Oid: oid }, 
                        select: { FullName: true } 
                    });
                    if (emp) {
                        resolvedText = resolvedText.replace(oid, emp.FullName || oid);
                        continue;
                    }
                    
                    // 2. Intentar buscar en turnos
                    const shift = await prisma.shift.findUnique({ 
                        where: { Oid: oid }, 
                        select: { Name: true } 
                    });
                    if (shift) {
                        resolvedText = resolvedText.replace(oid, shift.Name || oid);
                        continue;
                    }
                    
                    // 3. Intentar buscar en horarios
                    const tt = await prisma.timetable.findUnique({ 
                        where: { Oid: oid }, 
                        select: { Name: true } 
                    });
                    if (tt) {
                        resolvedText = resolvedText.replace(oid, tt.Name || oid);
                        continue;
                    }
                }
                return resolvedText;
            };

            // Resolver OIDs tanto en el objetivo como en la descripción
            const [resolvedTarget, resolvedDescription] = await Promise.all([
                resolveOID(targetStr),
                resolveOID(descriptionStr)
            ]);

            // Formateo final del Objetivo (Traducción de prefijos)
            let finalTarget = resolvedTarget || "Sin nombre";
            if (finalTarget.includes(':')) {
                const [prefix, ...rest] = finalTarget.split(':');
                const model = prefix.trim().toLowerCase();
                const translatedPrefix = targetMap[model] || prefix;
                finalTarget = `${translatedPrefix}: ${rest.join(':').trim()}`;
            }

            return {
                id: log.id,
                action: actionStr,
                target: finalTarget,
                user: log.auth_user?.username || `ID: ${log.user_id}`,
                time: log.op_time,
                description: resolvedDescription,
                ip: log.ip_address
            };
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
