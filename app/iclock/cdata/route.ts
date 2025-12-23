import { NextRequest, NextResponse } from "next/server";
import { admsService } from "@/server/biometric/adms";

/**
 * Ruta PRINCIPAL del protocolo ADMS.
 * Recibe:
 * 1. Handshakes (frecuentes): ?SN=...&options=all
 * 2. Datos (AttLog, OperLog, etc): POST body con datos de texto.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const sn = url.searchParams.get('SN') || '';

    // El dispositivo espera "OK" plano para confirmar conexión
    // Puede venir con argumentos como ?options=all
    console.log(`[ADMS-GET] Handshake desde ${sn}`);
    return new NextResponse("OK", { status: 200 });
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const sn = url.searchParams.get('SN') || '';
    const table = url.searchParams.get('table') || '';

    // Leer el cuerpo crudo (texto)
    const bodyText = await req.text();

    if (table === 'ATTLOG') {
        const result = await admsService.processAttendanceLogs(bodyText, sn);
        return new NextResponse(result, { status: 200 });
    }

    if (table === 'OPERLOG') {
        // Log de operaciones (admin entró al menú, etc) - Ignorar o guardar light
        return new NextResponse("OK", { status: 200 });
    }

    // Default: Si es un heartbeat con datos de estado
    await admsService.handleHandshake(url.searchParams, bodyText);

    return new NextResponse("OK", { status: 200 });
}
