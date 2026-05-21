import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { recordActivity } from "@/lib/activity-log";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { registros } = body; // Array de objetos desde el Excel

        if (!registros || !Array.isArray(registros)) {
            return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 });
        }

        let procesados = 0;
        let ignorados = 0;
        const errores = [];

        // Cache para búsquedas de empleados
        const employeeCache = new Map<string, string | null>();

        for (let i = 0; i < registros.length; i++) {
            const row = registros[i];
            try {
                // 1. Buscar Empleado (Por Documento o Nombre)
                const searchKey = String(row.Documento || row.Empleado || "").trim();
                if (!searchKey) {
                    ignorados++;
                    continue;
                }

                let employeeOid = employeeCache.get(searchKey);

                if (employeeOid === undefined) {
                    // Buscar en DB
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

                // 2. Parsear Fecha y Hora
                const checkTimeStr = row.Tiempo || row.FechaHora || row.CheckTime;
                if (checkTimeStr === undefined || checkTimeStr === null) {
                    errores.push(`Fila ${i + 2}: Tiempo requerido`);
                    ignorados++;
                    continue;
                }

                let checkTime: Date;
                if (typeof checkTimeStr === 'number') {
                    checkTime = new Date(Math.round((checkTimeStr - 25569) * 86400 * 1000));
                } else if (checkTimeStr instanceof Date) {
                    // Si ya es un objeto Date (algunos parsers de Excel lo devuelven así)
                    // Lo convertimos a "UTC puro" para evitar que Prisma lo mueva
                    checkTime = new Date(Date.UTC(
                        checkTimeStr.getFullYear(),
                        checkTimeStr.getMonth(),
                        checkTimeStr.getDate(),
                        checkTimeStr.getHours(),
                        checkTimeStr.getMinutes(),
                        checkTimeStr.getSeconds()
                    ));
                } else {
                    const strVal = String(checkTimeStr);
                    const parts = strVal.split(/[\s/:-]/);
                    if (parts.length >= 3) {
                        const d = parseInt(parts[0]);
                        let m = parseInt(parts[1]) - 1;
                        let y = parseInt(parts[2]);
                        
                        if (d > 1000) { // YYYY/MM/DD
                            y = d;
                            m = parseInt(parts[1]) - 1;
                            const newD = parseInt(parts[2]);
                            checkTime = new Date(Date.UTC(y, m, newD, parseInt(parts[3] || '0'), parseInt(parts[4] || '0'), parseInt(parts[5] || '0')));
                        } else { // DD/MM/YYYY
                            checkTime = new Date(Date.UTC(y, m, d, parseInt(parts[3] || '0'), parseInt(parts[4] || '0'), parseInt(parts[5] || '0')));
                        }
                    } else {
                        checkTime = new Date(checkTimeStr);
                    }
                }

                if (isNaN(checkTime.getTime())) {
                    errores.push(`Fila ${i + 2}: Formato de tiempo inválido (${checkTimeStr})`);
                    ignorados++;
                    continue;
                }

                // 3. Parsear Tipo (CheckType)
                let checkType = 0; // Default Entrada
                const rawTipo = row.Tipo !== undefined ? row.Tipo : row.CheckType;
                if (rawTipo !== undefined) {
                    const tipoStr = String(rawTipo).toLowerCase();
                    if (!isNaN(parseInt(tipoStr))) {
                        checkType = parseInt(tipoStr);
                    } else if (tipoStr.includes('entrada') || tipoStr === 'i') {
                        checkType = 0;
                    } else if (tipoStr.includes('salida') || tipoStr === 'o') {
                        checkType = 1;
                    } else if (tipoStr.includes('inicio descanso')) {
                        checkType = 2;
                    } else if (tipoStr.includes('fin descanso')) {
                        checkType = 3;
                    }
                }

                // Parsear VerifyCode
                let verifyCode: number | null = null;
                if (row.VerifyCode !== undefined && !isNaN(parseInt(row.VerifyCode))) {
                    verifyCode = parseInt(row.VerifyCode);
                } else if (row.MetodoVerificacion !== undefined && String(row.MetodoVerificacion).trim() !== "") {
                    verifyCode = 15; // Asumir rostro u otro genérico si viene en string y no se mapeó
                }

                // 4. Crear registro (CheckInOut)
                await prisma.checkinout.create({
                    data: {
                        Oid: crypto.randomUUID().toUpperCase(),
                        Employee: employeeOid,
                        CheckTime: checkTime,
                        CheckType: checkType, 
                        VerifyCode: verifyCode,
                        Machine: null, // Ignoramos la columna Machine intencionalmente
                        OptimisticLockField: 0,
                        GCRecord: null
                    }
                });

                procesados++;

            } catch (err: any) {
                errores.push(`Fila ${i + 2}: Error interno - ${err.message}`);
                ignorados++;
            }
        }

        // 5. Registrar actividad en logs
        await recordActivity({
            action: 'IMPORT',
            targetModel: 'checkinout',
            description: `Importación masiva de registros: ${procesados} procesados, ${ignorados} ignorados.`,
            req: request
        });

        return NextResponse.json({
            success: true,
            mensaje: `Importación finalizada. ${procesados} procesados, ${ignorados} ignorados.`,
            errores: errores.slice(0, 10) // Retornar solo los primeros 10 errores para no saturar
        });

    } catch (error) {
        console.error("Error en importación de registros:", error);
        return NextResponse.json(
            { error: "Error procesando el archivo" },
            { status: 500 }
        );
    }
}
