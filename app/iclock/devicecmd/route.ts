import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // El dispositivo envía el resultado de un comando ejecutado aquí
    // Ejemplo: "ID=123&Return=0"
    return new NextResponse("OK", { status: 200 });
}
