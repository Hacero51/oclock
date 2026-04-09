import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Map from Identifier to Spanish Name
const IDENTIFIER_NAMES: Record<string, string> = {
    'EndingOfNight': 'Fin de jornada nocturna',
    'MaximumNumberOfHoursWorkedPerDay': 'Máximo número de horas por día',
    'MinimumTimeBetweenMarkingOfExit': 'Tiempo mínimo entre marcaciones de salida',
    'MinimumTimeBetweenMarkingOfEntry': 'Tiempo mínimo entre marcaciones de entrada',
    'AdjustTheTimeByConcept': 'Ajustar tiempo por concepto',
    'MinimumTimeToExportByConcept': 'Tiempo mínimo de exportación por concepto',
    'MinimumTimeToCorrectMarking': 'Tiempo mínimo para corregir marcación',
    'BeginningOfNight': 'Inicio de jornada nocturna',
    'AdjustmentTime': 'Ajuste de tiempo'
};

const formatSecondsToTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null || isNaN(totalSeconds)) return "00:00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 1) return parts[0] * 3600; // Just hours? Fallback
    const [h, m, s] = parts;
    return (h * 3600) + (m * 60) + (s || 0);
};

export async function GET() {
    try {
        const configs = await prisma.configuration.findMany({
            where: {
                Group: { in: ['Attendance', 'Pre-payroll'] }
            },
            orderBy: { Position: 'asc' }
        });

        const oids = configs.map(c => c.Oid);

        // Fetch from different specialized tables
        const [timeSpans, adjTimes] = await Promise.all([
            prisma.configurationtimespan.findMany({ where: { Oid: { in: oids } } }),
            prisma.configurationadjustmenttime.findMany({ where: { Oid: { in: oids } } })
        ]);

        const timeSpanMap = new Map(timeSpans.map(t => [t.Oid, t.Value]));
        const adjTimeMap = new Map(adjTimes.map(t => [t.Oid, t.Value]));

        // Group by Group
        const grupos: any = {};
        
        configs.forEach(config => {
            const grupoName = config.Group === 'Attendance' ? 'Grupo Asistencia' : 'Grupo Pre-Nomina';
            if (!grupos[grupoName]) {
                grupos[grupoName] = {
                    id: `grupo-${config.Group}`,
                    nombre: grupoName,
                    recuperable: config.Group === 'Attendance' ? 4 : 5,
                    configuraciones: []
                };
            }

            let valor: string | null = null;
            let tipo: 'time' | 'select' | 'string' = 'time';

            if (config.Identifier === 'AdjustmentTime') {
                const adjVal = adjTimeMap.get(config.Oid);
                valor = adjVal === 1 ? 'Redondear' : String(adjVal || '');
                tipo = 'select';
            } else {
                const rawSeconds = timeSpanMap.get(config.Oid);
                if (rawSeconds !== undefined) {
                    valor = formatSecondsToTime(rawSeconds);
                    tipo = 'time';
                }
            }

            if (valor !== null) {
                grupos[grupoName].configuraciones.push({
                    id: config.Oid,
                    identifier: config.Identifier,
                    nombre: config.Identifier ? (IDENTIFIER_NAMES[config.Identifier] || config.Identifier) : 'Desconocido',
                    valor: valor,
                    tipo: tipo,
                    opciones: tipo === 'select' ? ['Redondear', 'Truncar', 'Ninguno'] : undefined
                });
            }
        });

        return NextResponse.json(Object.values(grupos));
    } catch (error) {
        console.error("Error fetching configurations:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const updates = await request.json(); // Array of { id: string, valor: string }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: "Estructura inválida" }, { status: 400 });
        }

        for (const update of updates) {
            // Find what type of config it is
            const config = await prisma.configuration.findUnique({ where: { Oid: update.id } });
            if (!config) continue;

            if (config.Identifier === 'AdjustmentTime') {
                const intVal = update.valor === 'Redondear' ? 1 : (update.valor === 'Truncar' ? 2 : 0);
                await prisma.configurationadjustmenttime.updateMany({
                    where: { Oid: update.id },
                    data: { Value: intVal }
                });
            } else {
                const seconds = parseTimeToSeconds(update.valor);
                await prisma.configurationtimespan.updateMany({
                    where: { Oid: update.id },
                    data: { Value: seconds }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating configurations:", error);
        return NextResponse.json({ error: "Error actualizando configuración" }, { status: 500 });
    }
}
