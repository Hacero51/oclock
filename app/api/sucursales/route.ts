import { NextResponse } from "next/server";

export async function GET() {
  const sucursales = [
    {
      "codigo": "01",
      "Nombre a mostrar": "7 DE AGOSTO",
      "Tercero": "INR",
      "correo": ""
    },
    {
      "codigo": "02",
      "Nombre a mostrar": "Mosquera",
      "Tercero": "INR",
      "correo": ""
    }
  ];

  return NextResponse.json(sucursales);
}