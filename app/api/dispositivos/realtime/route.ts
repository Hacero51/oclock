import { NextResponse } from "next/server";
import { rtSyncService } from "@/server/biometric/realtime";

export async function POST(request: Request) {
    try {
        const { action } = await request.json();

        if (action === 'start') {
            rtSyncService.start();
            return NextResponse.json({ success: true, message: "Servicio de tiempo real iniciado" });
        } else if (action === 'stop') {
            const result = await rtSyncService.stop();
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
