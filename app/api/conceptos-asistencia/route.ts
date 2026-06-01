import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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
            const name = admsNameMap[t.CodeToExport!] || nameMap[t.CodeToExport!] || `Concepto ${t.CodeToExport}`;
            return {
                id: t.Oid,
                codigo: t.CodeToExport || '',
                codigoExportar: t.CodeToExport || '',
                nombre: name,
                estado: t.Status === 1 ? 'Inactivo' : 'Activo',
                factor: t.Factor ? t.Factor.toString() : '0'
            };
        });

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

        const numericFactor = parseFloat(factor?.toString().replace(',', '.') || '0');
        const statusVal = estado === 'Activo' ? 0 : 1;

        let updated;
        // Si no tiene ID o es un concepto virtual "builtin-", lo creamos en la base de datos
        if (!id || id.startsWith('builtin-')) {
            const newOid = uuidv4().toUpperCase();
            updated = await prisma.attendancetype.create({
                data: {
                    Oid: newOid,
                    CodeToExport: codigoExportar && codigoExportar !== '-' ? codigoExportar : codigo,
                    Status: statusVal,
                    Factor: numericFactor
                }
            });
        } else {
            updated = await prisma.attendancetype.update({
                where: { Oid: id },
                data: {
                    CodeToExport: codigoExportar && codigoExportar !== '-' ? codigoExportar : codigo,
                    Status: statusVal,
                    Factor: numericFactor
                }
            });
        }

        // Actualizar el nombre en la tabla de conceptos ADMS
        const code = codigoExportar && codigoExportar !== '-' ? codigoExportar : codigo;
        if (code) {
            await prisma.personnel_payrollconcept.upsert({
                where: { pc_code: code },
                update: { pc_name: nombre },
                create: {
                    pc_code: code,
                    pc_name: nombre,
                    pc_type: 1,
                    type_value: "1",
                    judgment_type: false,
                }
            });
        }

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error("Error actualizando concepto:", error);
        return NextResponse.json({ error: "Error actualizando concepto" }, { status: 500 });
    }
}
