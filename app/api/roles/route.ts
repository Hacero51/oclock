
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.rolebase.findMany({
      select: {
        Oid: true,
        Name: true
      }
    });
    
    // Trim names
    const rolesClean = roles.map(r => ({
      Oid: r.Oid,
      Name: r.Name?.trim()
    }));

    return NextResponse.json(rolesClean);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
