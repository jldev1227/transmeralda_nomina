"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button, Divider } from "@nextui-org/react";

import { apiClient } from "@/config/apiClient";
import { User } from "@/context/AuthContext";
import LoadingPage from "@/components/loadingPage";

const Perfil = () => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  // Formulario para datos de usuario
  const [formData, setFormData] = useState<Partial<User>>({
    nombre: "",
    correo: "",
    telefono: "",
  });

  // Formulario para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Obtener datos del perfil
  const getProfileUser = async () => {
    try {
      setLoading(true);
      const { data: usuario } = await apiClient.get<{ data: User }>(
        "/api/usuarios/perfil",
      );

      setUsuario(usuario.data);
      setFormData({
        nombre: usuario.data.nombre,
        correo: usuario.data.correo,
        telefono: usuario.data.telefono || "",
      });
      setLoading(false);
    } catch (err: any) {
      setError("Error al cargar los datos del perfil");
      setLoading(false);
      console.error("Error:", err);
    }
  };

  // Obtener datos del perfil
  useEffect(() => {
    getProfileUser();
  }, []);

  // Manejar cambios en el formulario de datos personales
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordForm({ ...passwordForm, [name]: value });
  };

  // Actualizar datos personales
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data: usuario } = await apiClient.put(
        "/api/usuarios/actualizar-perfil",
        formData,
      );

      setUsuario(usuario.data);
      setEditMode(false);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Actualizar contraseña
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      return;
    }

    try {
      setLoading(true);
      await axios.put("/api/usuarios/perfil/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMode(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error:", err);
    }
  };

  // Formatear fecha del último acceso
  const formatearUltimoAcceso = (fecha: string) => {
    if (!fecha) return "Nunca";

    return format(new Date(fecha), "d 'de' MMMM 'de' yyyy, HH:mm", {
      locale: es,
    });
  };

  // Traducir roles a español
  const traducirRol = (role: User["role"]) => {
    const roles = {
      admin: "Administrador",
      gestor_flota: "Gestor de Flota",
      gestor_nomina: "Gestor de Nómina",
      usuario: "Usuario Estándar",
    };

    return roles[role] || role;
  };

  // Obtener lista de permisos en formato legible
  const obtenerPermisos = (permisos: {
    admin: boolean;
    flota: boolean;
    nomina: boolean;
  }) => {
    if (!permisos) return [];

    const listaPermisos = [];

    if (permisos.admin) listaPermisos.push("Administración");
    if (permisos.flota) listaPermisos.push("Gestión de Flota");
    if (permisos.nomina) listaPermisos.push("Gestión de Nómina");

    return listaPermisos;
  };

  if (loading && !usuario) {
    <LoadingPage>Obteniendo perfil</LoadingPage>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow items-center py-8 w-full md:max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 px-4">
          Perfil de Usuario
        </h1>

        {!editMode && !passwordMode && (
          <div className="flex flex-col md:flex-row gap-5">
            <div className="px-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Información Personal
                </h2>

                <div className="bg-gray-50 rounded-md">
                  <div className="mb-3">
                    <span className="block text-sm font-medium text-gray-500">
                      Nombre
                    </span>
                    <span className="block text-base">{usuario?.nombre}</span>
                  </div>

                  <div className="mb-3">
                    <span className="block text-sm font-medium text-gray-500">
                      Correo Electrónico
                    </span>
                    <span className="block text-base">{usuario?.correo}</span>
                  </div>

                  <div className="mb-3">
                    <span className="block text-sm font-medium text-gray-500">
                      Teléfono
                    </span>
                    <span className="block text-base">
                      {usuario?.telefono || "No especificado"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Button
                      className="rounded-md text-md"
                      color="primary"
                      onPress={() => setEditMode(true)}
                    >
                      Editar Información
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Seguridad
                </h2>
                <div className="bg-gray-50 rounded-md">
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-md transition-colors"
                    onClick={() => setPasswordMode(true)}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>

            <Divider className="sm:hidden" />
            <div className="px-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Roles y Permisos
              </h2>

              <div className="bg-gray-50 rounded-md">
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">
                    Rol Actual
                  </span>
                  <span className="block text-base font-medium">
                    {usuario && traducirRol(usuario.role)}
                  </span>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-500 mb-2">
                    Permisos Asignados
                  </span>
                  {usuario && obtenerPermisos(usuario.permisos).length > 0 ? (
                    <ul className="list-disc list-inside">
                      {obtenerPermisos(usuario.permisos).map(
                        (permiso, index) => (
                          <li key={index} className="text-base">
                            {permiso}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <span className="block text-base text-gray-600">
                      Sin permisos especiales
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Divider className="sm:hidden" />
            <div className="px-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Actividad
              </h2>
              <div className="bg-gray-50 rounded-md">
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">
                    Último Acceso
                  </span>
                  <span className="block text-base">
                    {usuario && formatearUltimoAcceso(usuario.ultimo_acceso)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="px-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Editar Información Personal
            </h2>

            <form
              className="bg-gray-50 rounded-md"
              onSubmit={handleUpdateProfile}
            >
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="nombre"
                >
                  Nombre
                </label>
                <input
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="correo"
                >
                  Correo Electrónico
                </label>
                <input
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="telefono"
                >
                  Teléfono
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>

                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors"
                  disabled={loading}
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      nombre: usuario?.nombre,
                      correo: usuario?.correo,
                      telefono: usuario?.telefono || "",
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {passwordMode && (
          <div className="px-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Cambiar Contraseña
            </h2>

            <form
              className="bg-gray-50 rounded-md"
              onSubmit={handleUpdatePassword}
            >
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="currentPassword"
                >
                  Contraseña Actual
                </label>
                <input
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="newPassword"
                >
                  Nueva Contraseña
                </label>
                <input
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="newPassword"
                  minLength={8}
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-500 mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirmar Nueva Contraseña
                </label>
                <input
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="confirmPassword"
                  minLength={8}
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </button>

                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors"
                  disabled={loading}
                  type="button"
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Perfil;
