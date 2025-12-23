import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { isValidName, isAdult } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status"); // 'activo', 'inactivo', 'todos'

    const whereClause: any = {};
    const personWhere: any = {};

    if (query) {
      personWhere.OR = [
        { FirstName: { contains: query } },
        { LastName: { contains: query } },
        { FullName: { contains: query } },
        { Document: { contains: query } },
      ];
    }

    if (status === "activo") {
      whereClause.Status = 0;
    } else if (status === "inactivo") {
      whereClause.Status = 1;
    }

    const empleados = await prisma.employee.findMany({
      where: whereClause,
    });

    // 2. Extraer IDs únicos para consultas en lote
    const departmentIds = [
      ...new Set(empleados.map((e) => e.Department).filter((id): id is string => !!id)),
    ];
    const shiftIds = [
      ...new Set(empleados.map((e) => e.CurrentShift).filter((id): id is string => !!id)),
    ];
    const positionIds = [
      ...new Set(empleados.map((e) => e.Position).filter((id): id is string => !!id)),
    ];
    const agreementTypeIds = [
      ...new Set(empleados.map((e) => e.CurrentAgreementType).filter((id): id is string => !!id)),
    ];
    const bossIds = [
      ...new Set(empleados.map((e) => e.Boss).filter((id): id is string => !!id)),
    ];

    // 2a. Recolectar IDs de empleados para buscar sus datos personales (eperson)
    const employeeIds = empleados.map((e) => e.Oid);

    // 3. Consultar departamentos y turnos en paralelo
    const [departamentos, turnos, cargos, contratos, jefes, personas] = await Promise.all([
      prisma.department.findMany({ where: { Oid: { in: departmentIds } } }),
      prisma.shift.findMany({ where: { Oid: { in: shiftIds } } }),
      prisma.position.findMany({ where: { Oid: { in: positionIds } } }),
      prisma.agreementtype.findMany({ where: { Oid: { in: agreementTypeIds } } }),
      prisma.eperson.findMany({ where: { Oid: { in: bossIds } } }),
      prisma.eperson.findMany({ where: { Oid: { in: employeeIds } } }),
    ]);

    // 4. Crear mapas para acceso rápido
    const deptMap = new Map(departamentos.map((d) => [d.Oid, d]));
    const shiftMap = new Map(turnos.map((s) => [s.Oid, s]));
    const positionMap = new Map(cargos.map((p) => [p.Oid, p]));
    const agreementMap = new Map(contratos.map((a) => [a.Oid, a]));
    const bossMap = new Map(jefes.map((b) => [b.Oid, b]));
    const personMap = new Map(personas.map((p) => [p.Oid, p]));

    // 5. Construir respuesta
    const resultado = empleados.map((emp) => {
      // Obtenemos la persona del mapa en lugar del include fallido
      const persona = personMap.get(emp.Oid);
      const departamento = emp.Department ? deptMap.get(emp.Department) : null;
      const turno = emp.CurrentShift ? shiftMap.get(emp.CurrentShift) : null;
      const cargo = emp.Position ? positionMap.get(emp.Position) : null;
      const contrato = emp.CurrentAgreementType ? agreementMap.get(emp.CurrentAgreementType) : null;
      const jefe = emp.Boss ? bossMap.get(emp.Boss) : null;

      // Filtro manual de búsqueda si se pasó 'query'
      if (query) {
        const q = query.toLowerCase();
        const matches =
          (persona?.FirstName?.toLowerCase().includes(q)) ||
          (persona?.LastName?.toLowerCase().includes(q)) ||
          (persona?.FullName?.toLowerCase().includes(q)) ||
          (persona?.Document?.toLowerCase().includes(q));

        if (!matches) return null;
      }

      const item = {
        "Número Lector": emp.AcNumber ?? "",
        Oid: emp.Oid,
        Documento: persona?.Document ?? "",
        "Nombre a mostrar": persona?.FullName ?? "",
        Departamento: departamento?.Name ?? "",
        "Turno Actual": turno?.Name ?? "",
        "Valor Hora": emp.ValorHora ?? "",
        Cargo: cargo?.Name ?? "",
        Contrato: contrato?.Name ?? "",
        Jefe: jefe?.FullName ?? "",
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

    // VALIDACIONES
    if (data.fullName && !isValidName(data.fullName)) {
      return NextResponse.json({ error: "El nombre solo puede contener letras y espacios" }, { status: 400 });
    }

    if (data.fechaNacimiento && !isAdult(data.fechaNacimiento)) {
      return NextResponse.json({ error: "El empleado debe ser mayor de 18 años" }, { status: 400 });
    }

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
    // 1. CREAR EPARTY (Entidad Base)
    // -----------------------------
    // ZKTeco usa herencia: Employee -> Person -> Party.
    // Debemos crear la raíz primero.
    await prisma.eparty.create({
      data: {
        Oid: newOid,
        DisplayName: (data.fullName || "").toUpperCase(),
        CreatedDate: new Date(),
        ObjectType: 1,
        OptimisticLockField: 0,
        GCRecord: null,
      },
    });

    // -----------------------------
    // 2. CREAR PERSONA
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
    // 3. CREAR EMPLEADO
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
        // NationalID: data.documento || null, // A veces se duplica aquí dependiente de la config
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
