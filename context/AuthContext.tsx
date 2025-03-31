"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { apiClient } from "@/config/apiClient";
import LoadingPage from "@/components/loadingPage";
// Importar para acceder a la función handleLogout

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
// Técnica para acceder a la función interna sin exponer directamente
const getLogoutFunction = () => {
  // Definir una función que simule un error de autenticación para invocar handleLogout
  return () => {
    // Limpiar cookies (similares a las de handleLogout)
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
      console.error("Error al obtener el perfil:", err);
      setError("No se pudo obtener la información del usuario");
      setUser(null);
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  // Cargar perfil al inicializar
  useEffect(() => {
    fetchUserProfile();

    // Establecer un tiempo máximo para la inicialización
    const timeoutId = setTimeout(() => {
      if (initializing) {
        setInitializing(false);
      }
    }, 5000); // 5 segundos máximo de espera

    return () => clearTimeout(timeoutId);
  }, []);

  // Contexto que será proporcionado
  const authContext: AuthContextType = {
    user,
    loading,
    error,
    logout,
    refreshProfile: fetchUserProfile,
  };

  // Mostrar pantalla de carga durante la inicialización
  if (initializing) {
    return <LoadingPage>Verificando acceso</LoadingPage>;
  }

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
