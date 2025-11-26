import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const empleados = await prisma.employee.findMany();

    const resultado = await Promise.all(
      empleados.map(async (emp) => {
        const [persona, departamento, turno] = await Promise.all([
          prisma.eperson.findUnique({
            where: { Oid: emp.Oid },
          }),

          emp.Department
            ? prisma.department.findUnique({
                where: { Oid: emp.Department },
              })
            : null,

          emp.CurrentShift
            ? prisma.shift.findUnique({
                where: { Oid: emp.CurrentShift },
              })
            : null,
        ]);

        const item = {
          "Número Lector": emp.AcNumber ?? "",
          Oid: emp.Oid,
          Documento: persona?.Document ?? "",
          "Nombre a mostrar": persona?.FullName ?? "",
          Departamento: departamento?.Name ?? "",
          "Turno Actual": turno?.Name ?? "",
          "Valor Hora": emp.ValorHora ?? "",
        };

        // 🔥 FILTRO FINAL: excluir registros sin datos útiles
        const tieneDatosReales =
          item["Nombre a mostrar"] !== "" ||
          item.Departamento !== "" ||
          item["Turno Actual"] !== "";

        return tieneDatosReales ? item : null;
      })
    );

    // 🔥 QUITAMOS NULLS
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




