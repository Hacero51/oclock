import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidName } from "@/lib/utils";

// ----------------------------
// GET: Obtener centro de costo por OID
// ----------------------------
export async function GET(request: Request, context: { params: Promise<{ Oid: string }> }) {
    try {
        const { Oid } = await context.params;

        const centroCosto = await prisma.costcenter.findUnique({
            where: { Oid },
        });

        if (!centroCosto) {
            return NextResponse.json({ error: "Centro de costo no encontrado" }, { status: 404 });
        }

        // Buscar empleados asociados a este centro de costo
        const employees = await prisma.employee.findMany({
            where: { CostCenter: Oid },
            include: {
                person: true
            }
        });

        // Extraer IDs para consultas en lote
        const deptIds = [...new Set(employees.map(e => e.Department).filter((id): id is string => !!id))];
        const shiftIds = [...new Set(employees.map(e => e.CurrentShift).filter((id): id is string => !!id))];
        const positionIds = [...new Set(employees.map(e => e.Position).filter((id): id is string => !!id))];
        const agreementIds = [...new Set(employees.map(e => e.CurrentAgreementType).filter((id): id is string => !!id))];
        const bossIds = [...new Set(employees.map(e => e.Boss).filter((id): id is string => !!id))];

        // Consultas paralelas
        const [departments, shifts, positions, agreements, bosses] = await Promise.all([
            prisma.department.findMany({ where: { Oid: { in: deptIds } } }),
            prisma.shift.findMany({ where: { Oid: { in: shiftIds } } }),
            prisma.position.findMany({ where: { Oid: { in: positionIds } } }),
            prisma.agreementtype.findMany({ where: { Oid: { in: agreementIds } } }),
            prisma.eperson.findMany({ where: { Oid: { in: bossIds } } })
        ]);

        // Crear mapas
        const deptMap = new Map(departments.map(d => [d.Oid, d]));
        const shiftMap = new Map(shifts.map(s => [s.Oid, s]));
        const posMap = new Map(positions.map(p => [p.Oid, p]));
        const agMap = new Map(agreements.map(a => [a.Oid, a]));
        const bossMap = new Map(bosses.map(b => [b.Oid, b]));

        // Mapear empleados
        const empleados = employees.map(emp => {
            const person = emp.person;
            const dept = emp.Department ? deptMap.get(emp.Department) : null;
            const shift = emp.CurrentShift ? shiftMap.get(emp.CurrentShift) : null;
            const pos = emp.Position ? posMap.get(emp.Position) : null;
            const ag = emp.CurrentAgreementType ? agMap.get(emp.CurrentAgreementType) : null;
            const boss = emp.Boss ? bossMap.get(emp.Boss) : null;

            return {
                Oid: emp.Oid,
                Documento: person?.Document || '',
                "Nombre a mostrar": `${person?.FirstName || ''} ${person?.MiddleName || ''} ${person?.LastName || ''} ${person?.MiddleLast || ''}`.trim().replace(/\s+/g, ' '),
                Cargo: pos?.Name || emp.Position || '',
                Departamento: dept?.Name || '',
                Contrato: ag?.Name || '',
                Jefe: boss?.FullName || '',
                "Turno Actual": shift?.Name || '',
                "Valor Hora": emp.ValorHora || emp.BaseSalary || 0,
                Status: emp.Status
            };
        });

        return NextResponse.json({
            Oid,
            codigo: centroCosto.Code,
            nombre: centroCosto.Name,
            empleados: empleados
        });

    } catch (err) {
        console.error("❌ Error GET centro de costo:", err);
        return NextResponse.json({ error: "Error interno GET" }, { status: 500 });
    }
}

// ----------------------------
// PUT: Actualizar centro de costo
// ----------------------------

export async function PUT(request: Request, context: { params: Promise<{ Oid: string }> }) {
    try {
        const { Oid } = await context.params;
        const data = await request.json();

        // VALIDACIÓN: El nombre es obligatorio y formato
        if (data.nombre && !isValidName(data.nombre)) {
            return NextResponse.json({ error: "El nombre solo puede contener letras y espacios" }, { status: 400 });
        }

        if (!data.nombre || data.nombre.trim() === '') {
            return NextResponse.json(
                { error: "El nombre es obligatorio" },
                { status: 400 }
            );
        }

        // VALIDACIÓN: Unicidad del Código
        if (data.codigo && data.codigo.trim() !== '') {
            const existingCode = await prisma.costcenter.findFirst({
                where: {
                    Code: data.codigo,
                    Oid: { not: Oid } // Excluir el registro actual
                }
            });

            if (existingCode) {
                return NextResponse.json(
                    { error: "Ya existe otro centro de costo con este código" },
                    { status: 400 }
                );
            }
        }

        // -----------------------------
        // ACTUALIZAR COST CENTER
        // -----------------------------
        await prisma.costcenter.update({
            where: { Oid },
            data: {
                Code: data.codigo || null,
                Name: data.nombre.trim(),
            },
        });

        return NextResponse.json({ message: "Centro de costo actualizado correctamente" });

    } catch (err) {
        console.error("❌ Error PUT centro de costo:", err);

        // Manejo de errores de Prisma
        let errorMessage = "Error actualizando centro de costo";
        if (err instanceof Error) {
            if (err.message.includes('Unique constraint')) {
                errorMessage = "Ya existe un registro con estos datos únicos";
            }
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}