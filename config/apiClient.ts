"use client";

import axios from "axios";

// Rutas que NO requieren autenticación (debe coincidir con middleware.ts y AuthGuard)
const PUBLIC_ROUTES = ["/conductores/desprendible", "/login", "/api/public"];

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }

    return pathname === route || pathname.startsWith(route + "/");
  });
}

// Función para obtener la ruta actual de forma segura
function getCurrentPath(): string {
  if (typeof window === "undefined") return "/"; // SSR fallback

  return window.location.pathname;
}

// Crear una instancia de axios sin usar hooks
const createApiClient = () => {
  const instance = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/nomina",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Esto enviará las cookies automáticamente
  });

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    const currentPath = getCurrentPath();

    // ===== VERIFICAR SI ESTAMOS EN RUTA PÚBLICA =====
    if (isPublicRoute(currentPath)) {
      return; // No hacer logout ni redirigir si estamos en ruta pública
    }

    // Limpiar cookies - eliminamos tanto token como userInfo
    // Eliminar token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Eliminar userInfo
    document.cookie =
      "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Asegurarse de eliminar en todos los dominios posibles
    const domainParts = window.location.hostname.split(".");

    if (domainParts.length > 1) {
      const rootDomain = domainParts.slice(-2).join(".");

      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
      document.cookie = `userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
    }

    // Redirigir al sistema de autenticación
    const authSystem =
      process.env.NEXT_PUBLIC_AUTH_SYSTEM || "https://auth.midominio.com/login";

    const returnUrl = encodeURIComponent(window.location.href);

    window.location.href = `${authSystem}?returnUrl=${returnUrl}`;
  };

  // Interceptor para incluir el token en cada petición
  instance.interceptors.request.use(
    (config) => {
      const currentPath = getCurrentPath();

      // Obtener token de cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      // ===== VERIFICAR SI ESTAMOS EN RUTA PÚBLICA =====
      if (isPublicRoute(currentPath)) {
        // En rutas públicas, incluir token solo si existe, pero no es requerido
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } else {
        // En rutas protegidas, el token es requerido
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => {
      console.error(`❌ Error en interceptor de request:`, error);

      return Promise.reject(error);
    },
  );

  // Interceptor para manejar errores de autenticación
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const currentPath = getCurrentPath();

      // Manejar errores de autenticación (401 - Unauthorized, 403 - Forbidden)
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        // ===== VERIFICAR SI ESTAMOS EN RUTA PÚBLICA =====
        if (isPublicRoute(currentPath)) {
          // En rutas públicas, un 401/403 es normal y no debe causar logout
          // Solo logueamos el error pero no redirigimos
          return Promise.reject(error);
        }

        // Solo ejecutar logout si estamos en una ruta protegida
        handleLogout();
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Crear una instancia para exportar
export const apiClient = createApiClient();

// Exportar también la función creadora por si se necesita una instancia fresca
export default createApiClient;
