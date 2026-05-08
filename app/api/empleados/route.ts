import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { isValidName, isAdult } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000"); // Aumentamos default para compatibilidad
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Filtro por estado
    if (status === "activo" || status === "activos") {
      whereClause.Status = 0;
    } else if (status === "inactivo" || status === "inactivos") {
      whereClause.Status = 1;
    }

    // Filtro para excluir registros "fantasmas" (sin nombre o documento)
    // Buscamos primero los OIDs de personas reales
    const realPersons = await prisma.eperson.findMany({
      where: {
        AND: [
          { FullName: { not: "" } },
          { Document: { not: "" } },
          { FullName: { not: null } },
          { Document: { not: null } },
        ]
      },
      select: { Oid: true }
    });
    const realOids = realPersons.map(p => p.Oid);
    whereClause.Oid = { in: realOids };

    // Filtro por nombre/documento (Database level)
    if (query) {
      const q = query.trim();
      // Refinar la búsqueda dentro de los ya filtrados como reales
      const matchedPersons = await prisma.eperson.findMany({
        where: {
          AND: [
            { Oid: { in: realOids } },
            {
              OR: [
                { FirstName: { contains: q } },
                { LastName: { contains: q } },
                { FullName: { contains: q } },
                { Document: { contains: q } },
              ]
            }
          ]
        },
        select: { Oid: true }
      });
      const matchedOids = matchedPersons.map(p => p.Oid);
      
      // Combinar con búsqueda por AcNumber (lector)
      const acNum = parseInt(q);
      whereClause.OR = [
        { Oid: { in: matchedOids } },
        ...(isNaN(acNum) ? [] : [{ AcNumber: acNum }])
      ];
    }

    const [total, empleados] = await Promise.all([
      prisma.employee.count({ where: whereClause }),
      prisma.employee.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { Oid: 'asc' }
      })
    ]);

    // 2. Extraer IDs únicos para consultas en lote
    const departmentIds = Array.from(new Set(empleados.map((e) => e.Department?.trim()).filter((id): id is string => !!id)));
    const shiftIds = Array.from(new Set(empleados.map((e) => e.CurrentShift?.trim()).filter((id): id is string => !!id)));
    const positionIds = Array.from(new Set(empleados.map((e) => e.Position?.trim()).filter((id): id is string => !!id)));
    const agreementTypeIds = Array.from(new Set(empleados.map((e) => e.CurrentAgreementType?.trim()).filter((id): id is string => !!id)));
    const bossIds = Array.from(new Set(empleados.map((e) => e.Boss?.trim()).filter((id): id is string => !!id)));
    const employeeIds = empleados.map((e) => e.Oid);

    // 3. Consultar datos relacionados en paralelo
    const [departamentos, turnos, cargos, contratos, jefes, personas] = await Promise.all([
      prisma.department.findMany({ where: { Oid: { in: departmentIds } } }),
      prisma.shift.findMany({ where: { Oid: { in: shiftIds } } }),
      prisma.position.findMany({ where: { Oid: { in: positionIds } } }),
      prisma.agreementtype.findMany({ where: { Oid: { in: agreementTypeIds } } }),
      prisma.eperson.findMany({ where: { Oid: { in: bossIds } } }),
      prisma.eperson.findMany({ where: { Oid: { in: employeeIds } } }),
    ]);

    // 4. Crear mapas (Normalizados)
    const deptMap = new Map(departamentos.map((d) => [d.Oid.trim().toLowerCase(), d]));
    const shiftMap = new Map(turnos.map((s) => [s.Oid.trim().toLowerCase(), s]));
    const positionMap = new Map(cargos.map((p) => [p.Oid.trim().toLowerCase(), p]));
    const agreementMap = new Map(contratos.map((a) => [a.Oid.trim().toLowerCase(), a]));
    const bossMap = new Map(jefes.map((b) => [b.Oid.trim().toLowerCase(), b]));
    const personMap = new Map(personas.map((p) => [p.Oid.trim().toLowerCase(), p]));

    // 5. Construir respuesta
    const resultado = empleados.map((emp) => {
      const empOidTrimmed = emp.Oid.trim().toLowerCase();
      const persona = personMap.get(empOidTrimmed);
      const departamento = emp.Department ? deptMap.get(emp.Department.trim().toLowerCase()) : null;
      const turno = emp.CurrentShift ? shiftMap.get(emp.CurrentShift.trim().toLowerCase()) : null;
      const cargo = emp.Position ? positionMap.get(emp.Position.trim().toLowerCase()) : null;
      const contrato = emp.CurrentAgreementType ? agreementMap.get(emp.CurrentAgreementType.trim().toLowerCase()) : null;
      const jefe = emp.Boss ? bossMap.get(emp.Boss.trim().toLowerCase()) : null;

      let deptName = departamento?.FullName || departamento?.Name || "";
      deptName = deptName.replace(/^(7 DE AGOSTO|CALLE 4|CALLE 4TA)\//i, "");

      return {
        "Número Lector": emp.AcNumber ?? "",
        Oid: emp.Oid,
        Documento: persona?.Document ?? "",
        "Nombre a mostrar": persona?.FullName ?? "",
        Departamento: deptName,
        "Turno Actual": turno?.Name ?? "",
        "Valor Hora": emp.ValorHora ?? "",
        Cargo: cargo?.Name ?? "",
        Contrato: contrato?.Name ?? "",
        Jefe: jefe?.FullName ?? "",
        Status: emp.Status ?? null,
      };
    });

    return NextResponse.json({
        data: resultado,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
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
    let FirstName = "", MiddleName = "", LastName = "", MiddleLast = "";

    if (partes.length === 1) {
      FirstName = partes[0];
    } else if (partes.length === 2) {
      FirstName = partes[0];
      LastName = partes[1];
    } else if (partes.length === 3) {
      FirstName = partes[0];
      LastName = partes[1];
      MiddleLast = partes[2];
    } else if (partes.length >= 4) {
      FirstName = partes[0];
      MiddleName = partes.slice(1, partes.length - 2).join(" ");
      LastName = partes[partes.length - 2];
      MiddleLast = partes[partes.length - 1];
    }

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
        AcNumber: data.AcNumber ? Number(data.AcNumber) : null,
        Privilege: data.Privilege ? Number(data.Privilege) : 0,
        CardNumber: data.CardNumber || null,
        AcPassword: data.AcPassword || null,
        Boss: data.jefe === "none" ? null : (data.jefe || null),
      },
    });
    
    // -----------------------------
    // 4. CREAR PERSONNEL_EMPLOYEE (Tabla Django/Personnel)
    // -----------------------------
    try {
      await (prisma as any).personnel_employee.create({
        data: {
          first_name: FirstName || "NUEVO",
          last_name: (LastName + " " + MiddleLast).trim() || "EMPLEADO",
          emp_code: data.documento || String(data.AcNumber || newOid.substring(0, 8)),
          status: 1,
          is_admin: false,
          enable_att: true,
          enable_overtime: true,
          enable_holiday: true,
          deleted: false,
          is_active: true,
          enable_payroll: true,
          company_id: 1,
          cost_centers_id: 1,
          department_id: 1, // Default or map if possible
        }
      });
    } catch (pErr) {
      console.error("⚠️ Error creando personnel_employee (no crítico):", pErr);
    }

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
