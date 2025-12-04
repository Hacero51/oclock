import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    // 1. Obtener empleados con su relación 'person'
    const empleados = await prisma.employee.findMany({
      include: {
        person: true,
      },
    });

    // 2. Extraer IDs únicos para consultas en lote
    const departmentIds = [
      ...new Set(empleados.map((e) => e.Department).filter((id): id is string => !!id)),
    ];
    const shiftIds = [
      ...new Set(empleados.map((e) => e.CurrentShift).filter((id): id is string => !!id)),
    ];

    // 3. Consultar departamentos y turnos en paralelo
    const [departamentos, turnos] = await Promise.all([
      prisma.department.findMany({
        where: { Oid: { in: departmentIds } },
      }),
      prisma.shift.findMany({
        where: { Oid: { in: shiftIds } },
      }),
    ]);

    // 4. Crear mapas para acceso rápido
    const deptMap = new Map(departamentos.map((d) => [d.Oid, d]));
    const shiftMap = new Map(turnos.map((s) => [s.Oid, s]));

    // 5. Construir respuesta
    const resultado = empleados.map((emp) => {
      const persona = emp.person;
      const departamento = emp.Department ? deptMap.get(emp.Department) : null;
      const turno = emp.CurrentShift ? shiftMap.get(emp.CurrentShift) : null;

      const item = {
        "Número Lector": emp.AcNumber ?? "",
        Oid: emp.Oid,
        Documento: persona?.Document ?? "",
        "Nombre a mostrar": persona?.FullName ?? "",
        Departamento: departamento?.Name ?? "",
        "Turno Actual": turno?.Name ?? "",
        "Valor Hora": emp.ValorHora ?? "",
        Status: emp.Status ?? null,
      };

      const tieneDatosReales =
        item["Nombre a mostrar"] !== "" ||
        item.Departamento !== "" ||
        item["Turno Actual"] !== "";

      return tieneDatosReales ? item : null;
    });

    const filtrados = resultado.filter((x) => x !== null);

    return NextResponse.json(filtrados);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error obteniendo empleados" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Datos recibidos en POST empleados:", data);

    // GENERAR OID tipo CHAR(38)
    const newOid = uuidv4().toUpperCase();

    // -----------------------------
    // DIVIDIR EL FULLNAME EN CAMPOS
    // -----------------------------
    const partes = (data.fullName || "").trim().split(/\s+/);

    const FirstName = partes[0] ?? "";
    const MiddleName = partes.length > 2 ? partes.slice(1, partes.length - 2).join(" ") : "";
    const LastName = partes.length >= 2 ? partes[partes.length - 2] : "";
    const MiddleLast = partes.length >= 3 ? partes[partes.length - 1] : "";

    // -----------------------------
    // CREAR PERSONA
    // -----------------------------
    const persona = await prisma.eperson.create({
      data: {
        Oid: newOid,
        Document: data.documento || null,
        FirstName,
        MiddleName,
        LastName,
        MiddleLast,
        FullName: (data.fullName || "").toUpperCase(),
        Email: data.email || null,
        Birthday: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
      },
    });

    // -----------------------------
    // CREAR EMPLEADO
    // -----------------------------
    const empleado = await prisma.employee.create({
      data: {
        Oid: newOid,
        Status: data.estado === "activo" ? 0 : 1,
        Department: data.departamento || null,
        Branch: data.sucursal || null,
        CostCenter: data.centroCosto || null,
        Position: data.cargo || null,
        CurrentShift: data.turnoActual || null,
        BaseSalary: data.salario ? Number(data.salario) : null,
        ValorHora: data.valorHora ? Number(data.valorHora) : null,
        GeneratesOverTime: data.tiempoExtra ? true : false,
      },
    });

    return NextResponse.json(
      {
        message: "Empleado creado correctamente",
        eperson: persona,
        employee: empleado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creando empleado:", error);
    return NextResponse.json({ error: "Error creando empleado" }, { status: 500 });
  }
}
