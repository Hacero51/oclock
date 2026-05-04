import { NextResponse } from "next/server";
import { sincronizarRelojes } from "@/server/biometric/sync";

export async function GET() {
    try {
        console.log("[DEBUG-SYNC] Iniciando sincronización manual...");
        const result = await sincronizarRelojes();
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("[DEBUG-SYNC] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
