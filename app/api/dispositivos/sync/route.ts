import { NextResponse, NextRequest } from "next/server";
import { sincronizarRelojes } from "@/server/biometric/sync";
import { rtSyncService } from "@/server/biometric/realtime";

export async function POST(request: NextRequest) {
    try {
        if (rtSyncService.isSyncing) {
            return NextResponse.json({
                success: false,
                error: "Sincronización automática en curso. Intente nuevamente en unos segundos."
            });
        }

        let devicesToSync = undefined;
        try {
            const body = await request.json();
            if (body && Array.isArray(body.devices)) {
                devicesToSync = body.devices;
            }
        } catch (e) {
            // Body is optional or empty
        }

        const resultado = await sincronizarRelojes(devicesToSync);
        return NextResponse.json(resultado);
    } catch (error: any) {
        console.error("Error en API de sincronización:", error);
        return NextResponse.json(
            { error: "Fallo al sincronizar dispositivos: " + error.message },
            { status: 500 }
        );
    }
}
