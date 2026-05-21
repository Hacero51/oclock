import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { laborEngine } from "@/server/biometric/engine";
import { recordActivity } from "@/lib/activity-log";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { marcaciones } = body; // Array de objetos desde el Excel

        if (!marcaciones || !Array.isArray(marcaciones)) {
            return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 });
        }

        let procesados = 0;
        let ignorados = 0;
        const errores = [];

        // Cache para búsquedas de empleados
        const employeeCache = new Map<string, string | null>();

        for (let i = 0; i < marcaciones.length; i++) {
            const row = marcaciones[i];
            try {
                // 1. Buscar Empleado (Por Documento o Nombre)
                const searchKey = String(row.Documento || row.Empleado || "").trim();
                if (!searchKey) {
                    ignorados++;
                    continue;
                }

                let employeeOid = employeeCache.get(searchKey);

                if (employeeOid === undefined) {
                    const person = await prisma.eperson.findFirst({
                        where: {
                            OR: [
                                { Document: searchKey },
                                { FullName: searchKey },
                                { FirstName: { contains: searchKey } },
                                { LastName: { contains: searchKey } }
                            ]
                        },
                        select: { Oid: true }
                    });
                    employeeOid = person?.Oid || null;
                    employeeCache.set(searchKey, employeeOid);
                }

                if (!employeeOid) {
                    errores.push(`Fila ${i + 2}: No se encontró el empleado "${searchKey}"`);
                    ignorados++;
                    continue;
                }

                // 2. Parsear Fechas
                const parseDateStr = (val: any) => {
                    if (val === undefined || val === null || val === "") return null;
                    let parsed: Date;
                    if (typeof val === 'number') {
                        // Excel serial date converts to pure UTC
                        parsed = new Date(Math.round((val - 25569) * 86400 * 1000));
                    } else {
                        const parts = String(val).split(/[\s/:-]/);
                        if (parts.length >= 3) {
                            const d = parseInt(parts[0]);
                            let m = parseInt(parts[1]) - 1;
                            let y = parseInt(parts[2]);
                            if (d > 1000) {
                                y = d;
                                m = parseInt(parts[1]) - 1;
                                const newD = parseInt(parts[2]);
                                parsed = new Date(Date.UTC(y, m, newD, parseInt(parts[3] || '0'), parseInt(parts[4] || '0'), parseInt(parts[5] || '0')));
                            } else {
                                parsed = new Date(Date.UTC(y, m, d, parseInt(parts[3] || '0'), parseInt(parts[4] || '0'), parseInt(parts[5] || '0')));
                            }
                        } else {
                            parsed = new Date(val);
                        }
                    }
                    return isNaN(parsed.getTime()) ? null : parsed;
                };

                const fechaDiaRaw = parseDateStr(row.Fecha || row.Day) || new Date();
                const entradaRaw = parseDateStr(row.Entrada || row.MarkingIn);
                const salidaRaw = parseDateStr(row.Salida || row.MarkingOut);

                if (isNaN(fechaDiaRaw.getTime())) {
                    errores.push(`Fila ${i + 2}: Formato de fecha inválido`);
                    ignorados++;
                    continue;
                }

                // Función para combinar la fecha de una celda con la hora de otra
                const combineDateAndTime = (baseDate: Date, timePart: Date | null) => {
                    if (!timePart) return null;
                    // Si timePart ya tiene fecha correcta (ej. > año 1910), lo usamos directo
                    if (timePart.getUTCFullYear() > 1910) return timePart;
                    
                    // Si timePart solo tiene la hora (típico de Excel), inyectamos la fecha de baseDate
                    return new Date(Date.UTC(
                        baseDate.getUTCFullYear(),
                        baseDate.getUTCMonth(),
                        baseDate.getUTCDate(),
                        timePart.getUTCHours(),
                        timePart.getUTCMinutes(),
                        timePart.getUTCSeconds()
                    ));
                };

                const entrada = combineDateAndTime(fechaDiaRaw, entradaRaw);
                const salida = combineDateAndTime(fechaDiaRaw, salidaRaw);
                const dayUTC = new Date(Date.UTC(fechaDiaRaw.getUTCFullYear(), fechaDiaRaw.getUTCMonth(), fechaDiaRaw.getUTCDate()));

                // 3. Validar si ya existe una marcación para evitar sobreescritura
                const existing = await prisma.marking.findFirst({
                    where: {
                        Employee: employeeOid,
                        Day: dayUTC
                    }
                });

                if (existing) {
                    errores.push(`Fila ${i + 2}: Ya existe una marcación para ${searchKey} el día ${dayUTC.getUTCDate()}/${dayUTC.getUTCMonth() + 1}/${dayUTC.getUTCFullYear()}. No se importó para evitar sobreescribir.`);
                    ignorados++;
                    continue;
                }

                // 4. Crear Marcación (Solo si no existe)
                await prisma.marking.create({
                    data: {
                        Oid: crypto.randomUUID().toUpperCase(),
                        Employee: employeeOid,
                        Day: dayUTC,
                        MarkingIn: entrada,
                        MarkingOut: salida,
                        Status: entrada && salida ? 0 : 2
                    }
                });

                // 5. Disparar Recálculo (Opcional pero recomendado para que el LaborEngine procese los tiempos)
                try {
                    await laborEngine.processDay(employeeOid, dayUTC);
                } catch (e) {
                    // Ignorar error de motor
                }

                procesados++;

            } catch (err: any) {
                errores.push(`Fila ${i + 2}: Error interno - ${err.message}`);
                ignorados++;
            }
        }

        // 5. Registrar actividad en logs
        await recordActivity({
            action: 'IMPORT',
            targetModel: 'marking',
            description: `Importación masiva de marcaciones: ${procesados} procesados, ${ignorados} ignorados.`,
            req: request
        });

        return NextResponse.json({
            success: true,
            mensaje: `Importación finalizada. ${procesados} procesados, ${ignorados} ignorados.`,
            errores: errores.slice(0, 10)
        });

    } catch (error) {
        console.error("Error en importación de marcaciones:", error);
        return NextResponse.json(
            { error: "Error procesando el archivo" },
            { status: 500 }
        );
    }
}
