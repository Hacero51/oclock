import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch raw data from tables that actually exist
    const [sucursalesRaw, departamentos, centros, turnos, positionsRaw, empleadosRaw] = await Promise.all([
      // Sucursales aka ebranch
      prisma.ebranch.findMany({
        select: {
          Oid: true,
          Description: true,
          Code: true,
          Third: true // We fetch the OID string, but won't join with a non-existent table
        },
      }),
      // Departamentos
      prisma.department.findMany({
        select: { Oid: true, Name: true, FullName: true },
        where: { GCRecord: null }
      }),
      // Centros de Costo
      prisma.costcenter.findMany({
        select: { Oid: true, Name: true },
      }),
      // Turnos
      prisma.shift.findMany({
        select: { Oid: true, Name: true },
      }),
      // Cargos (Usa 'position' que es la tabla legacy con OIDs, no personnel_position)
      prisma.position.findMany({
        select: { Oid: true, Name: true, Code: true }
      }),
      // Empleados (Solo IDs, luego buscamos nombres)
      prisma.employee.findMany({
        select: { Oid: true },
        where: { Status: 0 } // Solo activos? O todos para selectores? Mejor todos.
      }),
    ]);

    // 2. Resolve names for Employees (using eperson manually like in the main route)
    const employeeIds = empleadosRaw.map(e => e.Oid);
    const personas = await prisma.eperson.findMany({
      where: { Oid: { in: employeeIds } },
      select: { Oid: true, FullName: true }
    });

    const personMap = new Map(personas.map(p => [p.Oid, p.FullName]));

    const empleados = empleadosRaw.map(emp => ({
      Oid: emp.Oid,
      Name: personMap.get(emp.Oid) || "Sin Nombre"
    })).filter(e => e.Name !== "Sin Nombre");


    // 3. Process Sucursales (Keep the manual mapping logic if useful, but drop the 'Third' table lookup)
    const branchNames: Record<string, string> = {
      '01': '7 DE AGOSTO',
      '02': 'CALLE 4TA',
    };

    const sucursales = sucursalesRaw.map(s => {
      // Prioritize manual map, then Description, then Code
      let name = s.Description;
      if (s.Code && branchNames[s.Code]) {
        name = branchNames[s.Code];
      } else if (!name && s.Code) {
        name = `Sucursal ${s.Code}`;
      } else if (!name) {
        name = "Sin Descripción";
      }

      return {
        Oid: s.Oid,
        Description: name,
        Code: s.Code
      };
    });

    // 4. Transform positions
    const cargos = positionsRaw.map(p => ({
      Oid: p.Oid,     // Ahora sí es string Oid
      Code: p.Code,
      Name: p.Name
    }));


    // 4. Transform departments (strip branch prefixes)
    const cleanedDepartamentos = departamentos.map(d => {
      let fullName = d.FullName || d.Name || "";
      // Remove "7 DE AGOSTO/" or "CALLE 4/" or "CALLE 4TA/" if at the start
      fullName = fullName.replace(/^(7 DE AGOSTO|CALLE 4|CALLE 4TA)\//i, "");
      return { ...d, FullName: fullName };
    });

    return NextResponse.json({
      sucursales,
      departamentos: cleanedDepartamentos,
      centrosCosto: centros,
      turnos,
      cargos,
      empleados,
    });

  } catch (err) {
    console.error("❌ Error cargando catálogos (Data API):", err);
    return NextResponse.json(
      { error: "Error interno cargando catálogos" },
      { status: 500 }
    );
  }
}
