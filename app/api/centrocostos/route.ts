// app/api/centro-costos/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const centrocostos = [
    {
      "Codigo": "162",
      "Nombre": "ADHESIVO"
    },
    {
      "Codigo": "153", 
      "Nombre": "ADMINISTRACION"
    },
    {
      "Codigo": "170",
      "Nombre": "ADMINISTRACION\VENTAS"
    },
    {
      "Codigo": "352",
      "Nombre": "ALMACEN CALLE 4"
    }

  ];

  return NextResponse.json(centrocostos);
}