import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    console.log(`[API] Cargando festivos de la base de datos para el año: ${year}`);

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const holidays = await prisma.holiday.findMany({
      where: {
        Day: {
          gte: startOfYear,
          lte: endOfYear
        },
        GCRecord: null
      },
      orderBy: {
        Day: 'asc'
      }
    });

    const mappedHolidays = holidays.map((h: any) => {
      let diaFormateado = '';
      let fechaStr = '';
      if (h.Day) {
        const dateObj = new Date(h.Day);
        const opciones: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        };
        diaFormateado = dateObj.toLocaleDateString('es-CO', opciones).toUpperCase();
        fechaStr = dateObj.toISOString().split('T')[0];
      }

      return {
        id: h.Oid,
        dia: diaFormateado,
        nombre: h.Name || '',
        estado: h.Status === 0 ? 'Activo' : 'Inactivo',
        fecha: fechaStr
      };
    });

    return NextResponse.json(mappedHolidays);

  } catch (error) {
    console.error("Error en API de Días Festivos:", error);
    return NextResponse.json({ error: "Error al cargar días festivos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, fecha, estado } = body;

    if (!nombre || !fecha) {
      return NextResponse.json({ error: "Nombre y fecha son obligatorios" }, { status: 400 });
    }

    const newHoliday = await prisma.holiday.create({
      data: {
        Oid: uuidv4().toUpperCase(),
        Name: nombre,
        Day: new Date(`${fecha}T12:00:00.000Z`),
        Status: estado === 'Activo' ? 0 : 1,
        OptimisticLockField: 0
      }
    });

    const dateObj = new Date(newHoliday.Day!);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    };
    
    return NextResponse.json({
      id: newHoliday.Oid,
      dia: dateObj.toLocaleDateString('es-CO', opciones).toUpperCase(),
      nombre: newHoliday.Name,
      estado: newHoliday.Status === 0 ? 'Activo' : 'Inactivo',
      fecha: dateObj.toISOString().split('T')[0]
    }, { status: 201 });
  } catch (error) {
    console.error("Error creando día festivo:", error);
    return NextResponse.json({ error: "Error creando día festivo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, fecha, estado } = body;

    if (!id || !nombre || !fecha) {
      return NextResponse.json({ error: "ID, nombre y fecha son obligatorios" }, { status: 400 });
    }

    const updatedHoliday = await prisma.holiday.update({
      where: { Oid: id },
      data: {
        Name: nombre,
        Day: new Date(`${fecha}T12:00:00.000Z`),
        Status: estado === 'Activo' ? 0 : 1
      }
    });

    const dateObj = new Date(updatedHoliday.Day!);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    };

    return NextResponse.json({
      id: updatedHoliday.Oid,
      dia: dateObj.toLocaleDateString('es-CO', opciones).toUpperCase(),
      nombre: updatedHoliday.Name,
      estado: updatedHoliday.Status === 0 ? 'Activo' : 'Inactivo',
      fecha: dateObj.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("Error actualizando día festivo:", error);
    return NextResponse.json({ error: "Error actualizando día festivo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
    }

    await prisma.holiday.delete({
      where: { Oid: id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando día festivo:", error);
    return NextResponse.json({ error: "Error eliminando día festivo" }, { status: 500 });
  }
}
