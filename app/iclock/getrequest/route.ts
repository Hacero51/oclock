import { NextRequest, NextResponse } from "next/server";

/**
 * Ruta donde el dispositivo pregunta: "¿Tienes órdenes para mí?"
 * Se llama periódicamente.
 * Respuesta: "OK" si no hay nada, o "C:123:DATA..." si hay comandos.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const sn = url.searchParams.get('SN') || '';

    // Por ahora no tenemos sistema de cola de comandos (Borrar huellas, reiniciar, etc).
    // Respondemos OK para mantenerlo feliz.

    //console.log(`[ADMS-POLL] ${sn} pide comandos.`);
    return new NextResponse("OK", { status: 200 });
}
