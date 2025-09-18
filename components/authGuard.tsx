"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import LoadingPage from "@/components/loadingPage";

type AuthGuardProps = {
  children: React.ReactNode;
};

// Rutas que NO requieren autenticación (debe coincidir con middleware.ts)
const PUBLIC_ROUTES = [
  "/conductores/desprendible", // Esto cubrirá /conductores/desprendible/[id]
  "/login",
  "/api/public",
  // Agrega otras rutas públicas aquí
];

// Función para leer cookies de forma más confiable
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // Verificación para SSR

  // Método 1: Usando regex
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));

  if (match) return match[2];

  // Método 2: Usando split (como fallback)
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");

  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;

  return null;
}

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }

    return pathname === route || pathname.startsWith(route + "/");
  });
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated" | "public"
  >("loading");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Marcar que el componente está montado en el cliente
    setMounted(true);

    // Función para verificar autenticación
    const checkAuth = () => {
      // ===== VERIFICAR SI ES RUTA PÚBLICA =====
      if (isPublicRoute(pathname)) {
        setStatus("public");

        return;
      }

      // ===== VERIFICAR AUTENTICACIÓN PARA RUTAS PROTEGIDAS =====
      const token = getCookie("token");
      const userInfo = getCookie("userInfo");

      // Si hay token o userInfo, considerar autenticado
      if (token || userInfo) {
        setStatus("authenticated");

        return;
      }

      setStatus("unauthenticated");

      // Solo redirigir como último recurso después de un delay
      setTimeout(() => {
        const authSystem =
          process.env.NEXT_PUBLIC_AUTH_SYSTEM ||
          "https://auth.midominio.com/login";

        const returnUrl = encodeURIComponent(window.location.href);

        window.location.href = `${authSystem}?returnUrl=${returnUrl}`;
      }, 2000); // 2 segundos de delay para debug
    };

    // Solo verificar si estamos en el cliente
    if (mounted) {
      checkAuth();
    }
  }, [mounted, pathname]); // Agregar pathname como dependencia

  // No renderizar nada durante SSR
  if (!mounted) {
    return null;
  }

  // Mostrar pantalla de carga mientras verificamos
  if (status === "loading") {
    return <LoadingPage>Verificando acceso</LoadingPage>;
  }

  // Si está en proceso de redirección, mostrar mensaje apropiado
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            <span aria-label="alert-icon" role="img">
              🚨
            </span>{" "}
            Error de Autenticación
          </h2>
          <p className="text-gray-700 mb-4">
            Llegaste a una ruta protegida sin autenticación. El middleware
            debería haber redirigido antes.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirigiendo al sistema de autenticación en 2 segundos...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
        </div>
      </div>
    );
  }

  // Si es ruta pública O está autenticado, mostrar el contenido
  if (status === "public" || status === "authenticated") {
    return <>{children}</>;
  }

  // Fallback
  return <LoadingPage>Verificando permisos</LoadingPage>;
}
