"use client";

import React, { useEffect, useState } from "react";

import LoadingPage from "@/components/loadingPage";

type AuthGuardProps = {
  children: React.ReactNode;
};

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

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marcar que el componente está montado en el cliente
    setMounted(true);

    // Función para verificar autenticación
    const checkAuth = () => {
      console.log("Verificando autenticación...");
      console.log("Cookies actuales:", document.cookie);

      // Obtener token y userInfo
      const token = getCookie("token");
      const userInfo = getCookie("userInfo");

      console.log("Token encontrado:", token ? "Sí" : "No");
      console.log("UserInfo encontrado:", userInfo ? "Sí" : "No");

      // Si hay token o userInfo, considerar autenticado
      // (La validación real la hará el middleware)
      if (token || userInfo) {
        console.log("Usuario autenticado, mostrando contenido");
        setStatus("authenticated");

        return;
      }

      console.log("Usuario no autenticado, redirigiendo...");
      setStatus("unauthenticated");

      // Redirigir con un pequeño retraso para permitir que los logs se muestren
      setTimeout(() => {
        const authSystem =
          process.env.NEXT_PUBLIC_AUTH_SYSTEM ||
          "https://auth.midominio.com/login";

        window.location.href = `${authSystem}?returnUrl=${encodeURIComponent(window.location.href)}`;
      }, 500);
    };

    // Solo verificar si estamos en el cliente
    if (mounted) {
      checkAuth();
    }
  }, [mounted]);

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
    return <LoadingPage>Redirigiendo al login</LoadingPage>;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
}
