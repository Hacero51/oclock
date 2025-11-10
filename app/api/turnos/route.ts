import { NextResponse } from "next/server";

export async function GET() {
  const turnos = [
    {
      "Nombre": "OFICINA",
      "Estado": "ACTIVO"
    },
    {
      "Nombre": "PLANTA EXTRA",
      "Estado": "ACTIVO"
    }
  ];

  return NextResponse.json(turnos);
}