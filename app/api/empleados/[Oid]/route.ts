import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidName, isAdult } from "@/lib/utils";

// ----------------------------
// GET: Obtener empleado por OID
// ----------------------------
export async function GET(request: Request, context: { params: Promise<{ Oid: string }> }) {
  try {
    const { Oid } = await context.params;

    // Fetches paralelos de persona y empleado (ya que no hay relación directa en schema)
    const [persona, e] = await Promise.all([
      prisma.eperson.findUnique({ where: { Oid } }),
      prisma.employee.findUnique({ where: { Oid } }),
    ]);

    if (!persona) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }



    return NextResponse.json({
      Oid,
      documento: persona.Document,
      fullName: persona.FullName,
      nombre: persona.FirstName,
      segundoNombre: persona.MiddleName,
      apellido: persona.LastName,
      segundoApellido: persona.MiddleLast,
      email: persona.Email,
      fechaNacimiento: persona.Birthday,
      sucursal: e?.Branch || "",
      departamento: e?.Department || "",
      centroCosto: e?.CostCenter || "",
      turnoActual: e?.CurrentShift || "",
      salario: e?.BaseSalary || 0,
      estado: e?.Status === 0 ? "activo" : "inactivo",
      cargo: e?.Position || "",
      tiempoExtra: e?.GeneratesOverTime || false,
      valorHora: e?.ValorHora || 0,
      acNumber: e?.AcNumber || "",
      privilege: e?.Privilege || 0,
      cardNumber: e?.CardNumber || "",
      acPassword: e?.AcPassword || "",
    });

  } catch (err) {
    console.error("❌ Error GET empleado:", err);
    return NextResponse.json({ error: "Error interno GET" }, { status: 500 });
  }
}

// ----------------------------
// PUT: Actualizar empleado
// ----------------------------

export async function PUT(request: Request, context: { params: Promise<{ Oid: string }> }) {
  try {
    const { Oid } = await context.params;
    const data = await request.json();

    // VALIDACIONES
    const namesToCheck = [data.FullName, data.FirstName, data.MiddleName, data.LastName, data.MiddleLast];
    for (const name of namesToCheck) {
      if (name && !isValidName(name)) {
        return NextResponse.json({ error: "Los nombres solo pueden contener letras y espacios" }, { status: 400 });
      }
    }

    if (data.Birthday && !isAdult(data.Birthday)) {
      return NextResponse.json({ error: "El empleado debe ser mayor de 18 años" }, { status: 400 });
    }

    // -----------------------------
    // ACTUALIZAR EPERSON
    // -----------------------------
    await prisma.eperson.update({
      where: { Oid },
      data: {
        Document: data.Document || null,
        FullName: data.FullName || null,
        FirstName: data.FirstName || null,
        MiddleName: data.MiddleName || null,
        LastName: data.LastName || null,
        MiddleLast: data.MiddleLast || null,
        Email: data.Email || null,
        Birthday: data.Birthday ? new Date(data.Birthday) : null,
      },
    });

    // -----------------------------
    // ACTUALIZAR EMPLOYEE
    // -----------------------------
    await prisma.employee.update({
      where: { Oid },
      data: {
        Branch: data.Sucursal || null,
        Department: data.Departamento || null,
        CostCenter: data.CentroCosto || null,
        Position: data.Cargo || null,
        CurrentShift: data.TurnoActual || null,
        BaseSalary: data.Salario ? Number(data.Salario) : 0,
        ValorHora: data.ValorHora ? Number(data.ValorHora) : 0,
        Status: data.Estado === "activo" ? 0 : 1,
        GeneratesOverTime: data.TiempoExtra === true,
        AcNumber: data.AcNumber ? Number(data.AcNumber) : null,
        Privilege: data.Privilege ? Number(data.Privilege) : 0,
        CardNumber: data.CardNumber || null,
        AcPassword: data.AcPassword || null,
        Boss: data.Jefe === "none" ? null : (data.Jefe || null),
      },
    });
    
    // -----------------------------
    // ACTUALIZAR PERSONNEL_EMPLOYEE (Opcional/Best Effort)
    // -----------------------------
    try {
      const documentToSync = data.documento || data.Document;
      if (documentToSync) {
        await (prisma as any).personnel_employee.updateMany({
          where: { emp_code: String(documentToSync) },
          data: {
            first_name: data.FirstName || undefined,
            last_name: (data.LastName || "") + (data.MiddleLast ? " " + data.MiddleLast : ""),
            status: data.Status === "activo" ? 1 : 0,
          }
        });
      }
    } catch (pErr) {
      console.error("⚠️ Error actualizando personnel_employee (no crítico):", pErr);
    }

    return NextResponse.json({ message: "Empleado actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error PUT empleado:", err);
    return NextResponse.json({ error: "Error actualizando empleado" }, { status: 500 });
  }
}