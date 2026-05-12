import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function recordActivity({
  action,
  targetModel,
  targetId,
  targetName,
  description,
  req
}: {
  action: string;
  targetModel: string;
  targetId?: string | null;
  targetName?: string | null;
  description?: string | null;
  req?: Request;
}) {
  try {
    const session = await getServerSession(authOptions);
    const username = (session?.user as any)?.username || "sistema";
    
    // Obtener IP del request si está disponible
    let ip = null;
    if (req) {
        ip = req.headers.get("x-forwarded-for")?.split(',')[0] || 
             req.headers.get("x-real-ip") || 
             null;
    }

    // Buscar el ID del usuario en auth_user (necesario para base_adminlog)
    let authUser = await prisma.auth_user.findFirst({
        where: { username: username }
    });

    if (!authUser) {
        authUser = await prisma.auth_user.findFirst({
            where: { is_superuser: true }
        });
    }

    if (!authUser) {
        console.warn(`[LOG] No se encontró usuario en auth_user para ${username}. No se guardará el log.`);
        return;
    }

    // Insertar en la tabla existente base_adminlog
    await prisma.base_adminlog.create({
      data: {
        action: action.substring(0, 50),
        targets: targetId ? String(targetId) : null,
        targets_repr: targetName ? `${targetModel}: ${targetName}`.substring(0, 255) : `${targetModel}: ${targetId || 'N/A'}`.substring(0, 255),
        action_status: 1, 
        description: description || null,
        ip_address: ip ? ip.substring(0, 39) : null,
        can_routable: true,
        op_time: new Date(),
        user_id: authUser.id
      }
    });

  } catch (error) {
    console.error("Error recording activity log in base_adminlog:", error);
  }
}
