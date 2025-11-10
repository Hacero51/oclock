// app/api/centro-costos/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const centroCostos = [
    {
      "codigo": "162",
      "nombre": "ADHESIVO"
    },
    {
      "codigo": "153", 
      "nombre": "ADMINISTRACION"
    },
    {
      "codigo": "170",
      "nombre": "ADMINISTRACION\VENTAS"
    },
    {
      "codigo": "352",
      "nombre": "ALMACEN CALLE 4"
    }

  ];

  return NextResponse.json(centroCostos);
}