import { NextResponse } from "next/server";
import { reprocessHistory } from "@/server/biometric/sync";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desde, hasta } = body;

        if (!desde || !hasta) {
            return NextResponse.json({ error: "Parámetros 'desde' y 'hasta' son requeridos (formato: YYYY-MM-DD)" }, { status: 400 });
        }

        const startDate = new Date(`${desde}T00:00:00Z`);
        const endDate = new Date(`${hasta}T23:59:59Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
        }

        // Limitar a 62 días (2 meses aprox) por seguridad de timeout en serverless/next
        const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 62) {
            return NextResponse.json({ error: "Máximo 62 días por solicitud. Procesa en bloques mensuales." }, { status: 400 });
        }

        const result = await reprocessHistory(startDate, endDate);

        return NextResponse.json({
            success: true,
            resumen: result
        });

    } catch (error: any) {
        console.error("[RECALCULO-HISTORICO]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
