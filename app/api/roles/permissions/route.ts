import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PERMISSIONS_FILE = path.join(process.cwd(), "data", "role_permissions.json");

function normalizePermissions(data: any): Record<string, Record<string, string[]>> {
  const normalized: Record<string, Record<string, string[]>> = {};
  for (const role of Object.keys(data)) {
    const raw = data[role];
    if (Array.isArray(raw)) {
      // Formato antiguo: array plano de IDs permitidos. Otorga todos los permisos por defecto.
      normalized[role] = {};
      for (const sectionId of raw) {
        normalized[role][sectionId] = ["ver", "crear", "editar", "eliminar"];
      }
    } else if (typeof raw === "object" && raw !== null) {
      // Formato nuevo: objeto anidado. Verificamos estructura limpia.
      normalized[role] = {};
      for (const sectionId of Object.keys(raw)) {
        const val = raw[sectionId];
        normalized[role][sectionId] = Array.isArray(val) ? val : [];
      }
    }
  }
  return normalized;
}

export async function GET() {
  try {
    if (!fs.existsSync(PERMISSIONS_FILE)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(PERMISSIONS_FILE, "utf-8");
    const rawJSON = JSON.parse(data);
    const normalized = normalizePermissions(rawJSON);
    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const permissions = await request.json();
    
    // Create data dir if not exists
    const dataDir = path.dirname(PERMISSIONS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const normalized = normalizePermissions(permissions);
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(normalized, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
