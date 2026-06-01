import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidName, isAdult } from "@/lib/utils";
import { recordActivity } from "@/lib/activity-log";

// ----------------------------
// GET: Obtener empleado por OID
// ----------------------------
export async function GET(request: Request, context: { params: Promise<{ Oid: string }> }) {
  try {
    const { Oid } = await context.params;

    const [persona, e, party] = await Promise.all([
      prisma.eperson.findUnique({ where: { Oid } }),
      prisma.employee.findUnique({ where: { Oid } }),
      prisma.eparty.findUnique({ where: { Oid } }),
    ]);

    if (!persona) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    let photoUrl = "";
    if (party?.Photo) {
      const base64 = Buffer.from(party.Photo).toString("base64");
      photoUrl = `data:image/jpeg;base64,${base64}`;
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
      photoUrl,
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

    // 1. Obtener datos actuales para comparar cambios en el log
    const oldEmp = await prisma.employee.findUnique({ where: { Oid } });
    const oldStatus = oldEmp?.Status === 0 ? "activo" : "inactivo";
    const newStatus = data.Estado || (data.Status === 0 ? "activo" : "inactivo");

    // 2. Resolver nombre del turno si cambió
    let shiftName = "N/A";
    if (data.TurnoActual) {
        const s = await prisma.shift.findUnique({ where: { Oid: data.TurnoActual }, select: { Name: true } });
        shiftName = s?.Name || "Turno desconocido";
    }

    let detailMsg = "Actualización de datos generales";
    if (oldStatus !== newStatus) {
        detailMsg = `Cambio de estado: de ${oldStatus} a ${newStatus}`;
    } else if (data.TurnoActual && oldEmp?.CurrentShift !== data.TurnoActual) {
        detailMsg = `Cambio de turno a: ${shiftName}`;
    } else {
        detailMsg = `Actualización de perfil (Turno: ${shiftName})`;
    }

    // 3. ACTUALIZAR EPERSON
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

    // ACTUALIZAR PHOTO EN EPARTY
    if (data.PhotoUrl !== undefined) {
      if (data.PhotoUrl && data.PhotoUrl.startsWith("data:image")) {
        const base64Data = data.PhotoUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        await prisma.eparty.update({
          where: { Oid },
          data: { Photo: buffer }
        });
      } else if (data.PhotoUrl === "") {
        await prisma.eparty.update({
          where: { Oid },
          data: { Photo: null }
        });
      }
    }

    // 4. ACTUALIZAR EMPLOYEE
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
    
    // 5. ACTUALIZAR PERSONNEL_EMPLOYEE (Best Effort)
    try {
      const documentToSync = data.documento || data.Document;
      if (documentToSync) {
        await (prisma as any).personnel_employee.updateMany({
          where: { emp_code: String(documentToSync) },
          data: {
            first_name: data.FirstName || undefined,
            last_name: (data.LastName || "") + (data.MiddleLast ? " " + data.MiddleLast : ""),
            status: data.Estado === "activo" ? 1 : 0,
          }
        });
      }
    } catch (pErr) {
      console.error("⚠️ Error actualizando personnel_employee:", pErr);
    }

    // 6. REGISTRO DE ACTIVIDAD
    await recordActivity({
        action: "UPDATE",
        targetModel: "employee",
        targetId: Oid,
        targetName: data.FullName || data.fullName || Oid,
        description: detailMsg,
        req: request
    });

    return NextResponse.json({ message: "Empleado actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error PUT empleado:", err);
    return NextResponse.json({ error: "Error actualizando empleado" }, { status: 500 });
  }
}