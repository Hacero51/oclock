import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_USERNAME = "admin";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  //console.log("Middleware ejecutándose. Ruta:", pathname);
  //console.log("Token leído:", token);

  // Rutas públicas
  const publicRoutes = ["/login", "/"];
  const isPublic = publicRoutes.includes(pathname);

  // Si no está autenticado y no está entrando a una ruta pública
  if (!token && !isPublic) {
    //console.log("No autenticado — Redirigiendo a login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Rutas de administrador
  const adminRoutes = [
    "/administracion",
    "/administracion/usuarios",
    "/administracion/configuracion",
  ];

  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute && token?.username !== ADMIN_USERNAME) {
    //console.log("❌ Usuario NO es admin. Redirigiendo…");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
