import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: "active", message: "Debug endpoint cleaned." });
}
