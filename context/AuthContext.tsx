"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AxiosError, isAxiosError } from "axios";
import { usePathname } from "next/navigation";

import { apiClient } from "@/config/apiClient";
import LoadingPage from "@/components/loadingPage";

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

// Definir la interfaz para el usuario
export interface User {
  id: string;
  nombre: string;
  correo: string;
  role: "admin" | "gestor_flota" | "gestor_nomina" | "usuario";
  telefono: string;
  permisos: {
    flota: boolean;
    nomina: boolean;
    admin: boolean;
  };
  ultimo_acceso: string;
}

// Definir la interfaz para el contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Valor predeterminado para el contexto
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  logout: () => {},
  refreshProfile: async () => {},
};

// Crear el contexto con el valor predeterminado
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Obtener la función handleLogout del apiClient
const getLogoutFunction = () => {
  return () => {
    // Limpiar cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Intentar con dominios más generales
    const domainParts = window.location.hostname.split(".");

    if (domainParts.length > 1) {
      const rootDomain = domainParts.slice(-2).join(".");

      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
      document.cookie = `userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
    }

    // Redirigir al sistema de autenticación
    const authSystem =
      process.env.NEXT_PUBLIC_AUTH_SYSTEM || "https://auth.midominio.com/login";

    window.location.href = `${authSystem}?returnUrl=${encodeURIComponent(window.location.href)}`;
  };
};

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const pathname = usePathname();

  // Usar la función de logout del apiClient
  const logout = getLogoutFunction();

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (): Promise<void> => {
    try {
      setLoading(true);

      // Hacer la petición al endpoint de perfil
      const response = await apiClient.get("/api/usuarios/perfil");

      if (response.data && response.data.success) {
        setUser(response.data.data);
        setError(null);
      } else {
        throw new Error("Respuesta no exitosa del servidor");
      }
    } catch (err) {
      // Manejar diferentes tipos de errores
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiResponse<any>>;

        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          const errorMessage = axiosError.response.data?.message;

          if (statusCode === 401) {
            setError("Sesión expirada o usuario no autenticado");
          } else if (statusCode === 403) {
            setError("No tienes permisos para acceder a esta información");
          } else if (statusCode === 404) {
            setError("Información de usuario no encontrada");
          } else {
            setError(errorMessage || `Error en la petición (${statusCode})`);
          }
        } else if (axiosError.request) {
          setError(
            "No se pudo conectar con el servidor. Verifica tu conexión a internet",
          );
        } else {
          setError(`Error al configurar la petición: ${axiosError.message}`);
        }
      } else {
        setError(
          `No se pudo obtener la información del usuario: ${(err as Error).message}`,
        );
      }

      setUser(null);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  // Cargar perfil al inicializar (solo si no es ruta pública)
  useEffect(() => {
    // Si es ruta pública, no intentar cargar perfil
    if (isPublicRoute(pathname)) {
      setUser(null);
      setLoading(false);
      setInitializing(false);
      setError(null);

      return;
    }

    fetchUserProfile();

    // Establecer un tiempo máximo para la inicialización
    const timeoutId = setTimeout(() => {
      if (initializing) {
        setInitializing(false);
      }
    }, 5000); // 5 segundos máximo de espera

    return () => clearTimeout(timeoutId);
  }, [pathname]); // Dependencia en pathname para reaccionar a cambios de ruta

  // Contexto que será proporcionado
  const authContext: AuthContextType = {
    user,
    loading,
    error,
    logout,
    refreshProfile: fetchUserProfile,
  };

  // Mostrar pantalla de carga durante la inicialización (solo para rutas protegidas)
  if (initializing && !isPublicRoute(pathname)) {
    return <LoadingPage>Verificando acceso</LoadingPage>;
  }

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
