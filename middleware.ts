import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_USERNAME = "admin"; // Ajusta si tu admin se llama diferente

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // 🔒 1. Si NO hay token y quiere entrar a RUTAS PROTEGIDAS → redirigir a login
  const isPublicRoute = pathname.startsWith("/login") || pathname === "/";
  if (!token && !isPublicRoute) {
    console.log("⛔ No autenticado. Redirigiendo a login…");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔐 2. Rutas que SOLO el admin puede ver
  const adminRoutes = ["/administracion", "/administracion/usuarios", "/administracion/configuracion"];

  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    if (!token || token.username !== ADMIN_USERNAME) {
      console.log("❌ Usuario NO autorizado para ADMIN:", token?.username);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",   // proteger dashboard completo
    "/empresa/:path*",
    "/turnos/:path*",
    "/asistencia/:path*",
    "/dispositivos/:path*",
    "/reportes/:path*",
    "/maestros/:path*",
    "/administracion/:path*", // solo admin
  ],
};
