import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware global de seguridad.
 * Protege todas las rutas de /dashboard y /api (excepto auth).
 * Si no hay token de sesión, redirige a /login (para páginas) 
 * o devuelve 401 Unauthorized (para APIs).
 */
export default withAuth(
  function middleware(req) {
    // Lógica adicional opcional aquí
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Configuración de rutas a proteger
export const config = {
  matcher: [
    "/dashboard/:path*",
    // Protege todas las APIs EXCEPTO las de autenticación
    "/api/((?!auth).*)",
  ],
};
