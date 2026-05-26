import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Crear la respuesta base
    const response = NextResponse.next();

    // 🛡️ Inyectar cabeceras de seguridad globales recomendadas por OWASP
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Definición de rutas y recursos que requieren rol de administrador
    const adminRoutes = [
      "/administracion",
      "/api/usuarios"
    ];

    const isAdminRoute = adminRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute) {
      const username = token?.username as string | undefined;
      const roles = (token?.roles as string[] | undefined) || [];
      
      // Comprobar rol de administrador de forma robusta e insensible a mayúsculas
      const hasAdminRole =
        username === "admin" ||
        roles.some((role) =>
          ["admin", "administrador", "administradores"].includes(role.toLowerCase())
        );

      if (!hasAdminRole) {
        console.warn(`[SECURITY WARN] Acceso no autorizado denegado para el usuario: ${username || 'Desconocido'} en ruta administrativa: ${pathname}`);
        
        // Si es una ruta de API, responder con JSON 403 Forbidden
        if (pathname.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({
              error: true,
              message: "Acceso denegado. Se requieren privilegios de administrador."
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
                "X-Frame-Options": "DENY",
                "X-Content-Type-Options": "nosniff"
              }
            }
          );
        }
        
        // Si es una página normal del navegador, redirigir al Dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return response;
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

// Configuración de rutas protegidas globales
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/administracion/:path*",
    // Protege todas las APIs EXCEPTO las de autenticación
    "/api/((?!auth).*)",
  ],
};
