import { NextResponse } from "next/server";

export async function GET() {
  const turnos = [
    {
      "Nombre a mostrar": "12:00 PM A 20:00 PM",
      "Tiempo total": "08:00:00",
      "Tipo": "HORARIO FIJO"
    },
    {
      "Nombre a mostrar": "2:00 PM A 22:00 PM",
      "Tiempo total": "08:00:00",
      "Tipo": "HORARIO FIJO"
    }
  ];

  return NextResponse.json(turnos);
}