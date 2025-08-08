// middleware.ts (en la raíz del proyecto, mismo nivel que app/)
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = [
  "/conductores/desprendible", // Esto cubrirá /conductores/desprendible/[id]
  "/login",
  "/api/public", // Si tienes APIs públicas
  // Agrega otras rutas públicas aquí
];

// Rutas que siempre requieren autenticación
const PROTECTED_ROUTES = [
  "/admin",
  "/usuarios",
  "/liquidaciones",
  "/conductores/agregar",
  "/conductores/editar",
  // Agrega otras rutas protegidas aquí
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ===== VERIFICAR SI ES RUTA PÚBLICA =====
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("*")) {
      // Para rutas con wildcard como '/api/public*'
      return pathname.startsWith(route.slice(0, -1));
    }

    // Para rutas exactas o que comienzan con el patrón
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ===== VERIFICAR SI ES RECURSO ESTÁTICO =====
  if (
    pathname.startsWith("/_next/") || // Archivos de Next.js
    pathname.startsWith("/api/") || // APIs (evaluar caso por caso)
    pathname.startsWith("/static/") || // Archivos estáticos
    pathname.startsWith("/assets/") || // Assets
    pathname.includes(".") // Archivos con extensión (.ico, .png, .css, etc.)
  ) {
    return NextResponse.next();
  }

  // ===== VERIFICAR AUTENTICACIÓN PARA RUTAS PROTEGIDAS =====
  const token = request.cookies.get("token")?.value;
  const userInfo = request.cookies.get("userInfo")?.value;

  // Si no hay token ni userInfo, redirigir al login
  if (!token && !userInfo) {
    const authSystem =
      process.env.NEXT_PUBLIC_AUTH_SYSTEM || "https://auth.midominio.com/login";
    const returnUrl = encodeURIComponent(request.url);

    return NextResponse.redirect(`${authSystem}?returnUrl=${returnUrl}`);
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  // Matcher que excluye archivos estáticos y APIs específicas
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - Archivos con extensión
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
