
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PERMISSIONS_FILE = path.join(process.cwd(), "data", "role_permissions.json");

export async function GET() {
  try {
    if (!fs.existsSync(PERMISSIONS_FILE)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(PERMISSIONS_FILE, "utf-8");
    return NextResponse.json(JSON.parse(data));
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
    
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(permissions, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
