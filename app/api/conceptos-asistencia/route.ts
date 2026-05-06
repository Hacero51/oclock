import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const types = await prisma.attendancetype.findMany({
            orderBy: { CodeToExport: 'asc' }
        });

        // Obtener conceptos de la BD ADMS para resolución de nombres
        const admsConcepts = await prisma.personnel_payrollconcept.findMany({
            select: { pc_code: true, pc_name: true }
        });

        const admsNameMap: Record<string, string> = {};
        admsConcepts.forEach(c => {
            admsNameMap[c.pc_code] = c.pc_name;
        });

        // Diccionario interno de resolución de nombres (ya que la BD legacy solo guarda Oid y CodeToExport)
        const nameMap: Record<string, string> = {
            'A01': '01.HORA ORDINARIA DIURNA',
            'A49': '02.RECARGO NOCTURNO',
            'R48': '03.DESCUENTOS EN TIEMPO LABORADO',
            'A02': '03.HORAS EXTRAS ORDINARIAS DIURNAS',
            'A04': '04.HORAS EXTRAS ORDINARIAS NOCTURNAS',
            'A36': '04.BONIFICACION DIURNA',
            'A35': '04.BONIFICACION NOCTURNA',
            'A05': '05.HORA FESTIVA DIURNA',
            'A50': '06.HORA FESTIVA NOCTURNA',
            'A06': '07.HORAS EXTRAS FESTIVAS DIURNAS',
            'A08': '08.HORAS EXTRAS FESTIVAS NOCTURNAS',
            'A46': '08.HORAS EXTRAS FESTIVAS DIURNAS (Legacy)',
        };

        // Filtrar solo los que tienen Código para Exportar (evita basura/ghost records del sistema legacy)
        const filteredTypes = types.filter(t => t.CodeToExport && t.CodeToExport.trim() !== '');

        const list = filteredTypes.map((t) => {
            const name = nameMap[t.CodeToExport!] || `Concepto ${t.CodeToExport}`;
            return {
                id: t.Oid,
                codigo: t.CodeToExport || '',
                codigoExportar: t.CodeToExport || '',
                nombre: name,
                estado: t.Status === 1 ? 'Inactivo' : 'Activo',
                factor: t.Factor ? t.Factor.toString() : '0'
            };
        });

        // Solo incluir los obligatorios del sistema si no existen en la BD
        if (!list.some(l => l.codigo === '00')) {
            list.unshift({ id: 'builtin-00', codigo: '00', codigoExportar: '-', nombre: '00.TURNO', estado: 'Activo', factor: '0' });
        }
        
        if (!list.some(l => l.codigo === '98')) {
            list.push({ id: 'builtin-98', codigo: '98', codigoExportar: '-', nombre: '98.RETARDO', estado: 'Activo', factor: '0' });
        }
        
        if (!list.some(l => l.codigo === '99')) {
            list.push({ id: 'builtin-99', codigo: '99', codigoExportar: '-', nombre: '99.AUSENCIA', estado: 'Activo', factor: '0' });
        }

        return NextResponse.json(list);

    } catch (error) {
        console.error("Error obteniendo conceptos de asistencia:", error);
        return NextResponse.json({ error: "Error obteniendo conceptos" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, codigo, codigoExportar, nombre, estado, factor } = body;
        
        if (!id || id.startsWith('builtin-')) {
             return NextResponse.json({ error: "No se puede editar conceptos internos" }, { status: 400 });
        }

        const numericFactor = parseFloat(factor?.toString().replace(',', '.') || '0');
        const statusVal = estado === 'Activo' ? 0 : 1;

        const updated = await prisma.attendancetype.update({
             where: { Oid: id },
             data: {
                  CodeToExport: codigoExportar || codigo,
                  Status: statusVal,
                  Factor: numericFactor
             }
        });

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error("Error actualizando concepto:", error);
        return NextResponse.json({ error: "Error actualizando concepto" }, { status: 500 });
    }
}
