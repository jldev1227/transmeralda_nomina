"use client";

import React, { useState, useEffect, useRef } from "react";
import { addToast } from "@heroui/toast";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";

import { Configuracion, useNomina } from "@/context/NominaContext";
import { apiClient } from "@/config/apiClient";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/helpers/helpers";

export default function ConfiguracionPage() {
  const { configuracion } = useNomina();
  const [configLocal, setConfigLocal] = useState<Configuracion[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [valoresOriginales, setValoresOriginales] = useState<
    Map<string, number>
  >(new Map());
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  // Referencia para enfocar el input cuando se edita
  const inputRef = useRef<HTMLInputElement>(null);

  const configuracionOrdenada = configuracion
    ? [...configuracion].sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];

  useEffect(() => {
    if (configuracion) {
      setConfigLocal([...configuracionOrdenada]);
    }
  }, [configuracion]);

  // Enfocar input cuando se inicia la edición
  useEffect(() => {
    if (editandoId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editandoId]);

  const handleEdit = (id: string) => {
    // Verificar si hay cambios pendientes
    if (cambiosPendientes.size > 0 && editandoId !== id) {
      setPendingEditId(id);
      setShowUnsavedDialog(true);

      return;
    }

    const item = configLocal.find((item) => item.id === id);

    if (item) {
      setValoresOriginales((prev) => new Map(prev.set(id, Number(item.valor))));
      setEditandoId(id);
    }
  };

  const handleSave = async (id: string) => {
    const itemGuardado = configLocal.find((item) => item.id === id);

    if (!itemGuardado) return;

    setIsLoading(true);

    try {
      const { data } = await apiClient.put(
        `/api/nomina/conductores/configuracion/${id}`,
        {
          valor: Number(itemGuardado.valor),
        },
      );

      if (data.success) {
        setEditandoId(null);
        setValoresOriginales((prev) => {
          const newMap = new Map(prev);

          newMap.delete(id);

          return newMap;
        });
        setCambiosPendientes((prev) => {
          const newSet = new Set(prev);

          newSet.delete(id);

          return newSet;
        });
      } else {
        throw new Error(data.message || "Error al actualizar la configuración");
      }
    } catch (error: any) {
      console.error("Error al guardar:", error);

      // Revertir cambios en caso de error
      handleCancelSingle(id);

      addToast({
        title: "Error al actualizar",
        description:
          error?.response?.data?.message ||
          "Ocurrió un error al actualizar la configuración.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSingle = (id: string) => {
    const valorOriginal = valoresOriginales.get(id);

    if (valorOriginal !== undefined) {
      // Revertir al valor original
      setConfigLocal((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, valor: valorOriginal.toString() } : item,
        ),
      );
    }

    setEditandoId(null);
    setValoresOriginales((prev) => {
      const newMap = new Map(prev);

      newMap.delete(id);

      return newMap;
    });
    setCambiosPendientes((prev) => {
      const newSet = new Set(prev);

      newSet.delete(id);

      return newSet;
    });
  };

  const handleCancel = () => {
    if (editandoId) {
      handleCancelSingle(editandoId);
    }
  };

  const handleSaveAllPending = async () => {
    // Convertir Set a Array para iteración
    const pendingIds = Array.from(cambiosPendientes);

    for (const id of pendingIds) {
      await handleSave(id);
    }
  };

  const handleDiscardAllPending = () => {
    // Convertir Set a Array para iteración
    const pendingIds = Array.from(cambiosPendientes);

    for (const id of pendingIds) {
      handleCancelSingle(id);
    }
    setShowUnsavedDialog(false);
    setPendingEditId(null);
  };

  const handleProceedToNewEdit = () => {
    // Guardar cambios pendientes automáticamente
    handleSaveAllPending().then(() => {
      setShowUnsavedDialog(false);
      if (pendingEditId) {
        handleEdit(pendingEditId);
        setPendingEditId(null);
      }
    });
  };

  const handleValueChange = (id: string, newValue: string) => {
    // Limpiar y convertir el valor
    const cleanValue = newValue.replace(/[^\d.,]/g, "");
    const numericValue = cleanValue.replace(/[,.]/g, "");
    let finalValue = parseFloat(numericValue) || 0;

    // Encontrar el item para aplicar validaciones por tipo
    const item = configLocal.find((item) => item.id === id);

    if (item) {
      // Validaciones específicas por tipo
      if (item.tipo === "PORCENTAJE") {
        finalValue = Math.min(Math.max(finalValue, 0), 100);
      } else if (item.tipo === "MONTO_FIJO" || item.tipo === "VALOR_NUMERICO") {
        finalValue = Math.max(finalValue, 0);
      }
    }

    setConfigLocal((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, valor: finalValue.toString() } : item,
      ),
    );

    // Marcar como cambio pendiente si es diferente al valor original
    const valorOriginal = valoresOriginales.get(id);

    if (valorOriginal !== undefined && finalValue !== valorOriginal) {
      setCambiosPendientes((prev) => new Set(prev.add(id)));
    } else {
      setCambiosPendientes((prev) => {
        const newSet = new Set(prev);

        newSet.delete(id);

        return newSet;
      });
    }
  };

  const formatearValor = (valor: number, tipo: string) => {
    if (tipo === "PORCENTAJE") {
      return `${valor}%`;
    }

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const getFormattedInputValue = (item: Configuracion) => {
    const valor = Number(item.valor);

    if (!valor || valor === 0) return "";

    switch (item.tipo) {
      case "PORCENTAJE":
        return formatPercentage(valor);
      case "MONTO_FIJO":
        return formatCurrency(valor);
      default:
        return formatNumber(valor);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string,
  ) => {
    if (e.key === "Enter") {
      handleSave(id);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 rounded-md z-10">
            <div className="px-4 py-4 sm:px-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Configuración
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona los valores del sistema
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configLocal.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nombre}
                        </div>
                        {cambiosPendientes.has(item.id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                clipRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                fillRule="evenodd"
                              />
                            </svg>
                            Sin guardar
                          </span>
                        )}

                        {/* Barra flotante de cambios pendientes */}
                        {cambiosPendientes.size > 0 && !showUnsavedDialog && (
                          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-amber-50 text-amber-600 px-6 py-3 rounded-lg shadow-sm z-40 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  clipRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  fillRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm font-medium">
                                {cambiosPendientes.size} cambio
                                {cambiosPendientes.size !== 1 ? "s" : ""} sin
                                guardar
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="bg-white text-orange-600 hover:bg-gray-100 px-3 py-1 rounded text-sm font-medium transition-colors border-1"
                                disabled={isLoading}
                                onClick={handleSaveAllPending}
                              >
                                Guardar todo
                              </button>
                              <button
                                className="bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded text-sm text-white font-medium transition-colors border-1"
                                disabled={isLoading}
                                onClick={handleDiscardAllPending}
                              >
                                Descartar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.tipo === "PORCENTAJE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.tipo === "PORCENTAJE"
                          ? "Porcentaje"
                          : "Valor Numérico"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editandoId === item.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            ref={inputRef}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-base w-auto min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                            disabled={isLoading}
                            placeholder={
                              item.tipo === "PORCENTAJE" ? "0%" : "$0"
                            }
                            type="text"
                            value={getFormattedInputValue(item)}
                            onChange={(e) =>
                              handleValueChange(item.id, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                          />
                          <span className="text-sm text-gray-500 min-w-[30px]">
                            {item.tipo === "PORCENTAJE" ? "%" : "COP"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 font-medium">
                          {formatearValor(Number(item.valor), item.tipo)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {editandoId === item.id ? (
                        <>
                          <button
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            onClick={() => handleSave(item.id)}
                          >
                            {isLoading ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors disabled:opacity-50"
                            disabled={isLoading}
                            onClick={handleCancel}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                          onClick={() => handleEdit(item.id)}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="px-4 py-4 space-y-4">
          {configLocal.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 leading-tight flex items-center space-x-2">
                      <span>{item.nombre}</span>
                      {cambiosPendientes.has(item.id) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              clipRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              fillRule="evenodd"
                            />
                          </svg>
                          Sin guardar
                        </span>
                      )}
                    </h3>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.tipo === "PORCENTAJE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.tipo === "PORCENTAJE"
                          ? "Porcentaje"
                          : "Valor Numérico"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Value Section */}
                <div className="mb-4">
                  <label
                    className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                    htmlFor={`valor-${item.id}`}
                  >
                    Valor
                  </label>
                  {editandoId === item.id ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                          disabled={isLoading}
                          id={`valor-${item.id}`}
                          placeholder="Ingrese el valor"
                          type="text"
                          value={getFormattedInputValue(item)}
                          onChange={(e) =>
                            handleValueChange(item.id, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded-lg">
                        {item.tipo === "PORCENTAJE" ? "%" : "COP"}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-gray-900">
                        {formatearValor(Number(item.valor), item.tipo)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {editandoId === item.id ? (
                    <>
                      <button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        onClick={() => handleSave(item.id)}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        {isLoading ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                        disabled={isLoading}
                        onClick={handleCancel}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      onClick={() => handleEdit(item.id)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      Editar
                    </button>
                  )}
                </div>

                {/* Updated Date */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Actualizado:{" "}
                    {new Date(item.updatedAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {configLocal && configLocal.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-gray-400 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
              />
            </svg>
            <p className="text-lg font-medium">No hay configuraciones</p>
            <p className="text-sm mt-1">
              Aún no se han cargado las configuraciones del sistema
            </p>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para cambios pendientes */}
      <Modal
        isOpen={showUnsavedDialog}
        size="xl"
        onOpenChange={() => setShowUnsavedDialog(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Cambios sin guardar
                      </h3>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      Tienes {cambiosPendientes.size} configuración
                      {cambiosPendientes.size !== 1 ? "es" : ""} con cambios sin
                      guardar. ¿Qué deseas hacer?
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>
                        • <strong>Guardar cambios:</strong> Los cambios se
                        guardarán automáticamente
                      </p>
                      <p>
                        • <strong>Descartar cambios:</strong> Se perderán todos
                        los cambios pendientes
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      disabled={isLoading}
                      onClick={handleProceedToNewEdit}
                    >
                      Guardar cambios
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      disabled={isLoading}
                      onClick={handleDiscardAllPending}
                    >
                      Descartar cambios
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      disabled={isLoading}
                      onClick={() => {
                        setShowUnsavedDialog(false);
                        setPendingEditId(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
