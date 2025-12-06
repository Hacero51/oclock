// app/api/empleados/data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [sucursalesRaw, departamentos, centros, turnos, cargos, empleadosRaw] = await Promise.all([
      prisma.ebranch.findMany({
        select: {
          Oid: true,
          Description: true,
          Code: true,
          Third: true
        },
      }),
      prisma.department.findMany({
        select: { Oid: true, Name: true },
      }),
      prisma.costcenter.findMany({
        select: { Oid: true, Name: true },
      }),
      prisma.shift.findMany({
        select: { Oid: true, Name: true },
      }),
      prisma.personnel_position.findMany({
        select: { id: true, position_code: true, position_name: true },
      }),
      prisma.employee.findMany({
        select: {
          Oid: true,
          person: {
            select: { FullName: true }
          }
        },
      }),
    ]);

    // Get Third IDs from branches
    const thirdIds = sucursalesRaw
      .map(s => s.Third)
      .filter((id): id is string => !!id);

    // Fetch Third data
    const thirds = await prisma.third.findMany({
      where: { Oid: { in: thirdIds } },
      select: { Oid: true, TaxName: true, FirstName: true, LastName: true }
    });

    // Create a map for quick lookup
    const thirdMap = new Map(thirds.map(t => [t.Oid, t]));

    console.log('🏢 Datos de sucursales RAW:');
    sucursalesRaw.forEach(s => {
      console.log(`  - Oid: ${s.Oid}, Code: ${s.Code}, Description: ${s.Description}, Third: ${s.Third}`);
    });

    console.log('👥 Datos de Third encontrados:');
    thirds.forEach(t => {
      console.log(`  - Oid: ${t.Oid}, TaxName: ${t.TaxName}, FirstName: ${t.FirstName}, LastName: ${t.LastName}`);
    });

    // Manual mapping of branch codes to names based on database data
    const branchNames: Record<string, string> = {
      '01': '7 DE AGOSTO',
      '02': 'CALLE 4TA',
    };

    // Transform sucursales using manual mapping
    const sucursales = sucursalesRaw.map(s => {
      const name = s.Code && branchNames[s.Code]
        ? branchNames[s.Code]
        : s.Code
          ? `Sucursal ${s.Code}`
          : 'Sin código';

      return {
        Oid: s.Oid,
        Description: name,
        Code: s.Code
      };
    });

    // Transform employees to include name
    const empleados = empleadosRaw
      .filter(emp => emp.person?.FullName)
      .map(emp => ({
        Oid: emp.Oid,
        Name: emp.person!.FullName
      }));

    // Transform positions to match expected format
    const cargosTransformados = cargos.map(cargo => ({
      Oid: cargo.id.toString(),
      Code: cargo.position_code,
      Name: cargo.position_name
    }));

    console.log('📊 Datos cargados:');
    console.log('  - Sucursales:', sucursales.length);
    console.log('  - Departamentos:', departamentos.length);
    console.log('  - Centros de Costo:', centros.length);
    console.log('  - Turnos:', turnos.length);
    console.log('  - Cargos:', cargosTransformados.length);
    console.log('  - Empleados:', empleados.length);

    return NextResponse.json({
      sucursales,
      departamentos,
      centrosCosto: centros,
      turnos,
      cargos: cargosTransformados,
      empleados,
    });

  } catch (err) {
    console.error("❌ Error cargando catálogos:", err);
    return NextResponse.json(
      { error: "Error cargando catálogos" },
      { status: 500 }
    );
  }
}
