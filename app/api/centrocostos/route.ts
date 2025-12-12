import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { isValidName } from "@/lib/utils";

export async function GET() {
  try {
    const centrosCosto = await prisma.costcenter.findMany({
      select: {
        Oid: true,
        Code: true,
        Name: true,
      },
    });

    // Mapea los nombres de propiedades
    const datosFormateados = centrosCosto.map((item) => ({
      Oid: item.Oid,
      Codigo: item.Code,     // Cambia Code a Codigo
      Nombre: item.Name,     // Cambia Name a Nombre
    }));

    // Devuelve directamente el array formateado
    return NextResponse.json(datosFormateados); // Sin objeto wrapper

  } catch (err) {
    console.error("❌ Error cargando centro de costos:", err);
    return NextResponse.json(
      { error: "Error cargando centro de costos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Datos recibidos en POST centro de costos:", data);

    // VALIDACIONES BÁSICAS
    if (data.Name && !isValidName(data.Name)) {
      return NextResponse.json({ error: "El nombre solo puede contener letras y espacios" }, { status: 400 });
    }

    if (!data.Name || data.Name.trim() === '') {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // GENERAR OID tipo CHAR(38)
    const newOid = uuidv4().toUpperCase();

    // VERIFICAR SI YA EXISTE UN CÓDIGO IGUAL (opcional)
    if (data.Code) {
      const existingCode = await prisma.costcenter.findFirst({
        where: { Code: data.Code }
      });

      if (existingCode) {
        return NextResponse.json(
          { error: "Ya existe un centro de costo con este código" },
          { status: 400 }
        );
      }
    }

    // CREAR CENTRO DE COSTOS
    const centroCosto = await prisma.costcenter.create({
      data: {
        Oid: newOid,
        Code: data.Code || null,
        Name: data.Name.trim(),
      },
    });

    console.log("✅ Centro de costo creado:", centroCosto);

    return NextResponse.json(
      {
        message: "Centro de costos creado correctamente",
        costcenter: centroCosto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error en POST /api/centrocostos:", error);

    // Mensajes de error más específicos
    let errorMessage = "Error creando centro de costos";

    if (error instanceof Error) {
      // Errores de Prisma
      if (error.message.includes('Unique constraint')) {
        errorMessage = "Ya existe un centro de costo con estos datos";
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = "Error en las referencias de datos";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}