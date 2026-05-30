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
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Excluir programáticamente las rutas de autenticación de next-auth
        if (pathname.startsWith("/api/auth")) {
          return true;
        }
        
        return !!token;
      },
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
    // Coincide con todas las rutas /api/:path* y se filtran en callback authorized
    "/api/:path*",
  ],
};
