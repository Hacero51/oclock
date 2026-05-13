
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const username = "admin";
    const user = await prisma.euser.findFirst({
      where: { UserName: username }
    });

    if (!user) return NextResponse.json({ error: "User not found" });

    const userRolesRaw = await prisma.euserusers_eroleroles.findMany({
      where: { Users: user.Oid }
    });

    const rolesOids = userRolesRaw.map(ur => ur.Roles).filter(Boolean) as string[];
    const rolesData = await prisma.rolebase.findMany({
      where: { Oid: { in: rolesOids } },
      select: { Name: true }
    });

    const roles = rolesData.map(r => r.Name?.trim());

    // Check permissions file
    const PERMISSIONS_FILE = path.join(process.cwd(), "data", "role_permissions.json");
    let permissions = {};
    if (fs.existsSync(PERMISSIONS_FILE)) {
      permissions = JSON.parse(fs.readFileSync(PERMISSIONS_FILE, "utf-8"));
    }

    return NextResponse.json({
      username: user.UserName,
      oid: user.Oid,
      roles,
      permissions
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
