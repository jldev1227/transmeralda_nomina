import {
  AlertCircle,
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  Trash2,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

import { formatCurrency, formatDate } from "@/helpers/helpers";
import { Liquidacion, useNomina } from "@/context/NominaContext";

interface LiquidacionesTableProps {
  requestSort: (key: string) => void;
  currentItems: Liquidacion[];
  confirmarEliminarLiquidacion: (id: string, nombre: string) => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

interface RowAnimationState {
  [key: string]: {
    isNew: boolean;
    isUpdated: boolean;
    timestamp: number;
  };
}

export default function LiquidacionesTable({
  requestSort,
  currentItems,
  confirmarEliminarLiquidacion,
  selectedIds = [],
  onSelectItem = () => {},
}: LiquidacionesTableProps) {
  const { abrirModalDetalle, socketEventLogs, socketConnected } = useNomina();
  const router = useRouter();
  const [rowAnimations, setRowAnimations] = useState<RowAnimationState>({});
  const tableRef = useRef<HTMLTableElement>(null);

  // ... (mantén toda la lógica de useEffect existente)
  useEffect(() => {
    if (!socketEventLogs || socketEventLogs.length === 0) return;

    const latestEvents = [...socketEventLogs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    const now = Date.now();
    const newAnimations: RowAnimationState = { ...rowAnimations };

    latestEvents.forEach((event) => {
      if (event.eventName === "liquidacion_creada" && event.data.liquidacion) {
        const liquidacionId = event.data.liquidacion.id;

        newAnimations[liquidacionId] = {
          isNew: true,
          isUpdated: false,
          timestamp: now,
        };

        setTimeout(() => {
          const row = document.getElementById(
            `liquidacion-row-${liquidacionId}`,
          );

          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else if (
        event.eventName === "liquidacion_actualizada" &&
        event.data.liquidacion
      ) {
        const liquidacionId = event.data.liquidacion.id;

        if (!newAnimations[liquidacionId]?.isNew) {
          newAnimations[liquidacionId] = {
            isNew: false,
            isUpdated: true,
            timestamp: now,
          };
        }
      }
    });

    setRowAnimations(newAnimations);

    const timer = setTimeout(() => {
      setRowAnimations((prev) => {
        const updated: RowAnimationState = {};

        Object.entries(prev).forEach(([id, state]) => {
          if (now - state.timestamp < 5000) {
            updated[id] = state;
          }
        });

        return updated;
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [socketEventLogs]);

  return (
    <>
      {/* Indicador de conexión */}
      {socketConnected && (
        <div className="px-4 lg:px-6 py-2 bg-green-50 text-green-700 border-b border-green-100 flex items-center text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          <span>Sincronización en tiempo real activa</span>
        </div>
      )}

      {/* Vista Desktop - Tabla tradicional */}
      <div className="hidden lg:block overflow-x-auto">
        <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                scope="col"
              >
                <input
                  checked={
                    currentItems.length > 0 &&
                    selectedIds.length === currentItems.length
                  }
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  type="checkbox"
                  onChange={() => {
                    if (selectedIds.length === currentItems.length) {
                      currentItems.forEach((item) => {
                        if (selectedIds.includes(item.id)) {
                          onSelectItem(item.id);
                        }
                      });
                    } else {
                      currentItems.forEach((item) => {
                        if (!selectedIds.includes(item.id)) {
                          onSelectItem(item.id);
                        }
                      });
                    }
                  }}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                scope="col"
                onClick={() => requestSort("periodoStart")}
              >
                <div className="flex items-center">
                  Período
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                scope="col"
                onClick={() => requestSort("conductor")}
              >
                <div className="flex items-center">
                  Conductor
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                scope="col"
                onClick={() => requestSort("diasLaborados")}
              >
                <div className="flex items-center">
                  Días Lab.
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                scope="col"
                onClick={() => requestSort("sueldoTotal")}
              >
                <div className="flex items-center">
                  Monto
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                scope="col"
                onClick={() => requestSort("estado")}
              >
                <div className="flex items-center">
                  Estado
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((liquidacion) => {
              const animation = rowAnimations[liquidacion.id];
              const isNew = animation?.isNew || false;
              const isUpdated = animation?.isUpdated || false;

              return (
                <tr
                  key={liquidacion.id}
                  className={`
                    hover:bg-gray-50 
                    ${isNew ? "animate-highlight-new bg-green-50" : ""}
                    ${isUpdated ? "animate-highlight-update bg-blue-50" : ""}
                  `}
                  id={`liquidacion-row-${liquidacion.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <input
                      checked={selectedIds.includes(liquidacion.id)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      type="checkbox"
                      onChange={() => onSelectItem(liquidacion.id)}
                    />
                    {isNew && (
                      <span className="absolute h-full w-1 bg-green-500 left-0 top-0" />
                    )}
                    {isUpdated && !isNew && (
                      <span className="absolute h-full w-1 bg-blue-500 left-0 top-0" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(liquidacion.periodo_start)}
                    </div>
                    <div className="text-sm text-gray-500">
                      hasta {formatDate(liquidacion.periodo_end)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {liquidacion.conductor?.nombre}{" "}
                      {liquidacion.conductor?.apellido}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      ID: {liquidacion.conductor_id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {liquidacion.dias_laborados}
                    </div>
                    {liquidacion.dias_laborados_villanueva > 0 && (
                      <div className="text-xs text-gray-500">
                        {liquidacion.dias_laborados_villanueva} en Villa.
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(liquidacion.sueldo_total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Devengado: {formatCurrency(liquidacion.salario_devengado)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 text-xs leading-5 font-semibold rounded-full ${
                        liquidacion.estado === "Liquidado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {liquidacion.estado === "Liquidado" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {liquidacion.estado}
                    </span>
                    {liquidacion.fecha_liquidacion && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(
                          liquidacion.fecha_liquidacion,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-emerald-600 hover:text-emerald-900 transition-colors"
                        title="Ver detalle"
                        onClick={() => abrirModalDetalle(liquidacion.id)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar"
                        onClick={() =>
                          router.push(`/conductores/editar/${liquidacion.id}`)
                        }
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                        onClick={() =>
                          confirmarEliminarLiquidacion(
                            liquidacion.id,
                            liquidacion.conductor?.nombre,
                          )
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile/Tablet - Cards compactos */}
      <div className="lg:hidden space-y-3 px-4">
        {/* Checkbox para seleccionar todos - Mobile */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              checked={
                currentItems.length > 0 &&
                selectedIds.length === currentItems.length
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              type="checkbox"
              onChange={() => {
                if (selectedIds.length === currentItems.length) {
                  currentItems.forEach((item) => {
                    if (selectedIds.includes(item.id)) {
                      onSelectItem(item.id);
                    }
                  });
                } else {
                  currentItems.forEach((item) => {
                    if (!selectedIds.includes(item.id)) {
                      onSelectItem(item.id);
                    }
                  });
                }
              }}
            />
            <span className="text-sm text-gray-600">
              Seleccionar todos ({selectedIds.length}/{currentItems.length})
            </span>
          </label>
        </div>

        {/* Cards de liquidaciones */}
        {currentItems.map((liquidacion) => {
          const animation = rowAnimations[liquidacion.id];
          const isNew = animation?.isNew || false;
          const isUpdated = animation?.isUpdated || false;

          return (
            <div
              key={liquidacion.id}
              className={`
                bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200
                ${isNew ? "ring-2 ring-green-500 bg-green-50" : ""}
                ${isUpdated ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                ${selectedIds.includes(liquidacion.id) ? "ring-2 ring-emerald-500" : ""}
              `}
              id={`liquidacion-row-${liquidacion.id}`}
            >
              {/* Indicador de nuevo/actualizado */}
              {(isNew || isUpdated) && (
                <div
                  className={`h-1 w-full ${isNew ? "bg-green-500" : "bg-blue-500"}`}
                />
              )}

              <div className="p-4">
                {/* Header con checkbox y estado */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      checked={selectedIds.includes(liquidacion.id)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      type="checkbox"
                      onChange={() => onSelectItem(liquidacion.id)}
                    />
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        liquidacion.estado === "Liquidado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {liquidacion.estado === "Liquidado" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {liquidacion.estado}
                    </span>
                  </div>

                  {/* Acciones compactas */}
                  <div className="flex space-x-1">
                    <button
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Ver detalle"
                      onClick={() => abrirModalDetalle(liquidacion.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                      onClick={() =>
                        router.push(`/conductores/editar/${liquidacion.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar"
                      onClick={() =>
                        confirmarEliminarLiquidacion(
                          liquidacion.id,
                          liquidacion.conductor?.nombre,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Información principal en grid compacto */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Conductor */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {liquidacion.conductor?.nombre}{" "}
                        {liquidacion.conductor?.apellido}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      ID: {liquidacion.conductor_id.slice(0, 8)}...
                    </div>
                  </div>

                  {/* Período */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">
                        Período
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 ml-6">
                      {formatDate(liquidacion.periodo_start)}
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      hasta {formatDate(liquidacion.periodo_end)}
                    </div>
                  </div>

                  {/* Días laborados */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      Días Lab.
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {liquidacion.dias_laborados}
                      {liquidacion.dias_laborados_villanueva > 0 && (
                        <span className="text-xs text-gray-500 block">
                          ({liquidacion.dias_laborados_villanueva} Villa.)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">
                        Monto Total
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 ml-6">
                      {formatCurrency(liquidacion.sueldo_total)}
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      Devengado: {formatCurrency(liquidacion.salario_devengado)}
                    </div>
                  </div>
                </div>

                {/* Fecha de liquidación si existe */}
                {liquidacion.fecha_liquidacion && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Liquidado el{" "}
                      {new Date(
                        liquidacion.fecha_liquidacion,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
