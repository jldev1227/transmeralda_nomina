"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Edit,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import { Button } from "@nextui-org/react";

import handleGeneratePDF from "./pdfMaker";

import { Bonificacion, useNomina } from "@/context/NominaContext";
import { formatDate, formatDateShort } from "@/helpers/helpers";

interface DetalleRecargo {
  id: string;
  empresa: string;
  mes: string;
  pagaCliente: boolean;
  valor: number;
}

const LiquidacionDetalleModal: React.FC = () => {
  const { liquidacionActual, showDetalleModal, cerrarModales } = useNomina();
  const [activeTab, setActiveTab] = useState<string>("general");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    recargos: false,
    pernotes: false,
    mantenimientos: false,
    bonificaciones: false,
    anticipos: false,
  });

  // Si no hay liquidación o no se debe mostrar el modal, no renderizar nada
  if (!liquidacionActual || !showDetalleModal) return null;

  // Función para formatear monedas
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Calcular totales
  const totalDeducciones =
    (liquidacionActual.salud || 0) + (liquidacionActual.pension || 0);
  const netoAPagar = Math.max(0, liquidacionActual.sueldo_total || 0);

  // Obtener nombre del conductor
  const conductorNombre = liquidacionActual.conductor
    ? `${liquidacionActual.conductor.nombre} ${liquidacionActual.conductor.apellido}`
    : "No especificado";

  // Obtener periodos formateados
  const periodoInicio = formatDate(liquidacionActual.periodo_start);
  const periodoFin = formatDate(liquidacionActual.periodo_end);

  // Información de usuarios
  const creadoPor = liquidacionActual.creado_por_id
    ? liquidacionActual.creadoPor.nombre.trim()
    : "No registrado";

  const actualizadoPor = liquidacionActual.actualizado_por_id
    ? liquidacionActual.actualizadoPor.nombre.trim()
    : "No registrado";

  const liquidadoPor = liquidacionActual.liquidado_por_id
    ? liquidacionActual.liquidadoPor.nombre.trim()
    : "No registrado";

  // Función para alternar la visualización de una sección
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-10">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-full overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">
            Detalle de Liquidación
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={cerrarModales}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200 px-6 sticky top-14 bg-white z-10">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-1 ${activeTab === "general" ? "text-emerald-600 border-b-2 border-emerald-500 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button
              className={`py-2 px-1 ${activeTab === "conceptos" ? "text-emerald-600 border-b-2 border-emerald-500 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("conceptos")}
            >
              Conceptos
            </button>
            <button
              className={`py-2 px-1 ${activeTab === "detalles" ? "text-emerald-600 border-b-2 border-emerald-500 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("detalles")}
            >
              Detalles
            </button>
            <button
              className={`py-2 px-1 ${activeTab === "auditoria" ? "text-emerald-600 border-b-2 border-emerald-500 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("auditoria")}
            >
              Auditoría
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Pestaña: General */}
          {activeTab === "general" && (
            <>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  INFORMACIÓN GENERAL
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Conductor</p>
                    <p className="text-base font-medium">{conductorNombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Período</p>
                    <p className="text-base font-medium">
                      {periodoInicio} - {periodoFin}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span
                      className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        liquidacionActual.estado === "Liquidado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {liquidacionActual.estado === "Liquidado" && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {liquidacionActual.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  DATOS SALARIALES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Salario Devengado</p>
                    <p className="text-base font-medium">
                      {formatCurrency(liquidacionActual.salario_devengado)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sueldo Total</p>
                    <p className="text-base font-medium text-emerald-600">
                      {formatCurrency(liquidacionActual.sueldo_total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  DÍAS LABORADOS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Días</p>
                    <p className="text-base font-medium">
                      {liquidacionActual.dias_laborados} días
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Días en Villanueva</p>
                    <p className="text-base font-medium">
                      {liquidacionActual.dias_laborados_villanueva} días
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Días Anuales</p>
                    <p className="text-base font-medium">
                      {liquidacionActual.dias_laborados_anual} días
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehículos asociados */}
              {liquidacionActual.vehiculos &&
                liquidacionActual.vehiculos.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      VEHÍCULOS ASOCIADOS
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {liquidacionActual.vehiculos.map((vehiculo: any) => (
                        <div
                          key={vehiculo.id}
                          className="bg-gray-50 p-2 rounded"
                        >
                          <p className="font-medium">{vehiculo.placa}</p>
                          <p className="text-xs text-gray-500">
                            {vehiculo.marca} {vehiculo.modelo}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Resumen Financiero */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  RESUMEN FINANCIERO
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Ingresos</p>
                    <p className="text-base font-medium text-emerald-600">
                      {formatCurrency(
                        liquidacionActual.sueldo_total + totalDeducciones,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Deducciones</p>
                    <p className="text-base font-medium text-red-600">
                      {formatCurrency(totalDeducciones)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Neto a Pagar</p>
                    <p className="text-base font-medium text-emerald-600">
                      {formatCurrency(netoAPagar)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {liquidacionActual.observaciones && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    OBSERVACIONES
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {liquidacionActual.observaciones}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pestaña: Conceptos */}
          {activeTab === "conceptos" && (
            <>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  MONTOS Y CONCEPTOS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Salario Base
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.salario_devengado)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Auxilio Transporte
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.auxilio_transporte)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">
                            Bonificaciones
                          </span>
                          <button
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            onClick={() => toggleSection("bonificaciones")}
                          >
                            {expandedSections.bonificaciones ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            liquidacionActual.total_bonificaciones,
                          )}
                        </span>
                      </div>

                      {/* Detalle de bonificaciones */}
                      {expandedSections.bonificaciones &&
                        liquidacionActual.bonificaciones &&
                        liquidacionActual.bonificaciones.length > 0 &&
                        (() => {
                          // Creamos un objeto para agrupar las bonificaciones por vehículo
                          const bonificacionesPorVehiculo: any = {};

                          // Recorremos todas las bonificaciones
                          liquidacionActual.bonificaciones.forEach(
                            (bonificacion: Bonificacion) => {
                              const vehiculoId = bonificacion.vehiculo_id;
                              const vehiculoInfo = bonificacion.vehiculo;
                              const valorUnitario = Number(bonificacion.value);

                              // Inicializamos el vehículo si no existe
                              if (!bonificacionesPorVehiculo[vehiculoId]) {
                                bonificacionesPorVehiculo[vehiculoId] = {
                                  vehiculo: vehiculoInfo,
                                  total_bonificaciones: 0,
                                  bonos: [],
                                };
                              }

                              // Calculamos el total para esta bonificación sumando todos los meses
                              let totalBonificacion = 0;

                              bonificacion.values.forEach(
                                (mesItem: {
                                  value: number;
                                  quantity: number;
                                }) => {
                                  totalBonificacion +=
                                    mesItem.quantity * valorUnitario;
                                },
                              );

                              // Agregamos esta bonificación a la lista de bonos del vehículo
                              bonificacionesPorVehiculo[vehiculoId].bonos.push({
                                id: bonificacion.id,
                                nombre: bonificacion.name,
                                total: totalBonificacion,
                              });

                              // Sumamos al total del vehículo
                              bonificacionesPorVehiculo[
                                vehiculoId
                              ].total_bonificaciones += totalBonificacion;
                            },
                          );

                          // Convertimos a array y ordenamos por placa
                          const vehiculosArray = Object.values(
                            bonificacionesPorVehiculo,
                          ).sort((a: any, b: any) =>
                            a.vehiculo.placa.localeCompare(b.vehiculo.placa),
                          );

                          return (
                            <div className="mt-4">
                              <h3 className="text-base font-semibold mb-2">
                                Resumen de Bonificaciones por Vehículo
                              </h3>

                              {vehiculosArray.length > 0 ? (
                                <div className="space-y-4">
                                  {vehiculosArray.map((item: any) => (
                                    <div
                                      key={item.vehiculo.id}
                                      className="border rounded-md overflow-hidden"
                                    >
                                      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                        <div>
                                          <span className="font-medium">
                                            {item.vehiculo.marca}{" "}
                                            {item.vehiculo.modelo}
                                          </span>
                                          <span className="ml-2 text-sm font-bold">
                                            ({item.vehiculo.placa})
                                          </span>
                                        </div>
                                        <span className="font-bold text-right">
                                          {formatCurrency(
                                            item.total_bonificaciones,
                                          )}
                                        </span>
                                      </div>

                                      {expandedSections &&
                                        expandedSections.bonificaciones && (
                                          <div className="pl-4 border-l-2 border-gray-200 p-2">
                                            {item.bonos.length > 0 ? (
                                              item.bonos.map(
                                                (bono: {
                                                  id: string;
                                                  nombre: string;
                                                  total: number;
                                                }) => (
                                                  <div
                                                    key={bono.id}
                                                    className="flex justify-between text-xs my-1"
                                                  >
                                                    <span className="text-gray-600">
                                                      {bono.nombre}
                                                    </span>
                                                    <span className="font-medium">
                                                      {formatCurrency(
                                                        bono.total,
                                                      )}
                                                    </span>
                                                  </div>
                                                ),
                                              )
                                            ) : (
                                              <div className="text-xs text-gray-500">
                                                No hay bonificaciones
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">
                                  No hay bonificaciones registradas
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">
                            Recargos
                          </span>
                          <button
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            onClick={() => toggleSection("recargos")}
                          >
                            {expandedSections.recargos ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.total_recargos)}
                        </span>
                      </div>

                      {/* Detalle de recargos */}
                      {expandedSections.recargos &&
                        liquidacionActual.recargos &&
                        liquidacionActual.recargos.length > 0 &&
                        (() => {
                          // Creamos un objeto para agrupar los recargos por vehículo
                          const recargosPorVehiculo: any = {};

                          // Recorremos todos los recargos
                          liquidacionActual.recargos.forEach((recargo) => {
                            const vehiculoId = recargo.vehiculo_id;
                            const vehiculoInfo = recargo.vehiculo;
                            const valor = Number(recargo.valor);

                            // Inicializamos el vehículo si no existe
                            if (!recargosPorVehiculo[vehiculoId]) {
                              recargosPorVehiculo[vehiculoId] = {
                                vehiculo: vehiculoInfo,
                                total_recargos: 0,
                                detalles: [],
                              };
                            }

                            // Agregamos este recargo a la lista de detalles del vehículo
                            recargosPorVehiculo[vehiculoId].detalles.push({
                              id: recargo.id,
                              empresa: recargo.empresa.Nombre,
                              mes: recargo.mes,
                              valor: valor,
                              pagaCliente: recargo.pag_cliente,
                            });

                            // Sumamos al total del vehículo
                            recargosPorVehiculo[vehiculoId].total_recargos +=
                              valor;
                          });

                          // Calculamos el total general y totales por tipo de pago
                          let totalGeneral = 0;
                          let totalPagadoPorCliente = 0;

                          Object.values(recargosPorVehiculo).forEach(
                            (item: any) => {
                              totalGeneral += item.total_recargos;

                              // Calculamos cuánto paga el cliente
                              item.detalles.forEach(
                                (detalle: DetalleRecargo) => {
                                  if (detalle.pagaCliente) {
                                    totalPagadoPorCliente += detalle.valor;
                                  }
                                },
                              );
                            },
                          );

                          // Convertimos a array y ordenamos por placa
                          const vehiculosArray = Object.values(
                            recargosPorVehiculo,
                          ).sort((a: any, b: any) => {
                            if (a.vehiculo && b.vehiculo) {
                              return a.vehiculo.placa.localeCompare(
                                b.vehiculo.placa,
                              );
                            }

                            return 0;
                          });

                          return (
                            <div className="space-y-3">
                              <h3 className="text-base font-semibold mb-2'">
                                Resumen de Recargos por Vehículo
                              </h3>

                              {vehiculosArray.length > 0 ? (
                                <div className="space-y-4">
                                  {vehiculosArray.map((item: any) => (
                                    <div
                                      key={item.vehiculo?.id || "sin-vehiculo"}
                                      className="border rounded-md overflow-hidden"
                                    >
                                      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                        <div>
                                          <span className="font-medium">
                                            {item.vehiculo.marca}{" "}
                                            {item.vehiculo.modelo}
                                          </span>
                                          <span className="ml-2 text-sm font-bold">
                                            ({item.vehiculo.placa})
                                          </span>
                                        </div>
                                        <span className="font-bold text-right">
                                          {formatCurrency(item.total_recargos)}
                                        </span>
                                      </div>

                                      {expandedSections &&
                                        expandedSections.recargos && (
                                          <div className="pl-4 border-l-2 border-gray-200 p-2">
                                            {item.detalles.length > 0 ? (
                                              item.detalles
                                                .sort((a: any, b: any) => {
                                                  // Ordenar primero por mes
                                                  const mesesOrden: any = {
                                                    Enero: 1,
                                                    Febrero: 2,
                                                    Marzo: 3,
                                                    Abril: 4,
                                                    Mayo: 5,
                                                    Junio: 6,
                                                    Julio: 7,
                                                    Agosto: 8,
                                                    Septiembre: 9,
                                                    Octubre: 10,
                                                    Noviembre: 11,
                                                    Diciembre: 12,
                                                  };

                                                  const mesAOrden =
                                                    mesesOrden[a.mes] || 0;
                                                  const mesBOrden =
                                                    mesesOrden[b.mes] || 0;

                                                  if (mesAOrden !== mesBOrden) {
                                                    return (
                                                      mesAOrden - mesBOrden
                                                    );
                                                  }

                                                  // Si los meses son iguales, ordenar por empresa
                                                  return a.empresa.localeCompare(
                                                    b.empresa,
                                                  );
                                                })
                                                .map(
                                                  (detalle: DetalleRecargo) => (
                                                    <div
                                                      key={detalle.id}
                                                      className="flex justify-between text-xs my-1"
                                                    >
                                                      <div>
                                                        <span className="text-gray-600">
                                                          {detalle.empresa}{" "}
                                                          {detalle.mes &&
                                                            `(${detalle.mes})`}
                                                        </span>
                                                        {detalle.pagaCliente && (
                                                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                                            Paga Cliente
                                                          </span>
                                                        )}
                                                      </div>
                                                      <span className="font-medium">
                                                        {formatCurrency(
                                                          detalle.valor,
                                                        )}
                                                      </span>
                                                    </div>
                                                  ),
                                                )
                                            ) : (
                                              <div className="text-xs text-gray-500">
                                                No hay recargos
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}

                                  <div className="mt-3 pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">
                                        TOTAL RECARGOS:
                                      </span>
                                      <span className="font-bold text-lg">
                                        {formatCurrency(totalGeneral)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm mt-1">
                                      <span className="font-medium text-green-600">
                                        Pagado por cliente:
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {formatCurrency(totalPagadoPorCliente)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                      <span className="font-medium text-gray-700">
                                        Asumido por propietario:
                                      </span>
                                      <span className="font-medium text-gray-700">
                                        {formatCurrency(
                                          totalGeneral - totalPagadoPorCliente,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">
                                  No hay recargos registrados
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">
                            Pernotes
                          </span>
                          <button
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            onClick={() => toggleSection("pernotes")}
                          >
                            {expandedSections.pernotes ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.total_pernotes)}
                        </span>
                      </div>

                      {/* Detalle de pernotes */}
                      {expandedSections.pernotes &&
                        liquidacionActual.pernotes &&
                        liquidacionActual.pernotes.length > 0 &&
                        (() => {
                          // Creamos un objeto para agrupar los pernotes por vehículo
                          const pernotesPorVehiculo: any = {};

                          // Recorremos todos los pernotes
                          liquidacionActual.pernotes.forEach((pernote) => {
                            const vehiculoId = pernote.vehiculo_id;
                            const vehiculoInfo = pernote.vehiculo;
                            const valor = Number(pernote.valor);
                            const cantidad =
                              pernote.cantidad ||
                              (pernote.fechas ? pernote.fechas.length : 0);

                            // Inicializamos el vehículo si no existe
                            if (!pernotesPorVehiculo[vehiculoId]) {
                              pernotesPorVehiculo[vehiculoId] = {
                                vehiculo: vehiculoInfo,
                                total_pernotes: 0,
                                cantidad_total: 0,
                                detalles: [],
                              };
                            }

                            // Agregamos este pernote a la lista de detalles del vehículo
                            pernotesPorVehiculo[vehiculoId].detalles.push({
                              id: pernote.id,
                              empresa_id: pernote.empresa_id,
                              fechas: pernote.fechas || [],
                              valor: valor,
                              cantidad: cantidad,
                            });

                            // Sumamos al total del vehículo
                            pernotesPorVehiculo[vehiculoId].total_pernotes +=
                              valor;
                            pernotesPorVehiculo[vehiculoId].cantidad_total +=
                              cantidad;
                          });

                          // Convertimos a array y ordenamos por placa
                          const vehiculosArray = Object.values(
                            pernotesPorVehiculo,
                          ).sort((a: any, b: any) => {
                            if (a.vehiculo && b.vehiculo) {
                              return a.vehiculo.placa.localeCompare(
                                b.vehiculo.placa,
                              );
                            }

                            return 0;
                          });

                          return (
                            <div className="space-y-3">
                              <h3 className="text-base font-semibold mb-2">
                                Resumen de Pernotes por Vehículo
                              </h3>

                              {vehiculosArray.length > 0 ? (
                                <div className="space-y-4">
                                  {vehiculosArray.map((item: any) => (
                                    <div
                                      key={item.vehiculo?.id || "sin-vehiculo"}
                                      className="border rounded-md overflow-hidden"
                                    >
                                      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                        <div>
                                          <span className="font-medium">
                                            {item.vehiculo.marca}{" "}
                                            {item.vehiculo.modelo}
                                          </span>
                                          <span className="ml-2 text-sm font-bold">
                                            ({item.vehiculo.placa})
                                          </span>
                                          <span className="ml-2 text-sm text-gray-600">
                                            ({item.cantidad_total} noches)
                                          </span>
                                        </div>
                                        <span className="font-bold text-right">
                                          {formatCurrency(
                                            item.total_pernotes *
                                              item.cantidad_total,
                                          )}
                                        </span>
                                      </div>

                                      {expandedSections &&
                                        expandedSections.pernotes && (
                                          <div className="pl-4 border-l-2 border-gray-200 p-2">
                                            {item.detalles.length > 0 ? (
                                              item.detalles.map(
                                                (detalle: any) => (
                                                  <div
                                                    key={detalle.id}
                                                    className="my-2"
                                                  >
                                                    <div className="flex justify-between text-xs mb-1">
                                                      <div>
                                                        <span className="text-gray-600">
                                                          Cantidad:{" "}
                                                          {detalle.cantidad}{" "}
                                                          {detalle.cantidad > 1
                                                            ? "noches"
                                                            : "noche"}
                                                        </span>
                                                      </div>
                                                      <span className="text-gray-600">
                                                        valor unitario:{" "}
                                                        {formatCurrency(
                                                          detalle.valor,
                                                        )}
                                                      </span>
                                                    </div>
                                                    {detalle.fechas &&
                                                      detalle.fechas.length >
                                                        0 && (
                                                        <div className="flex flex-wrap gap-1 text-xs text-gray-500 mt-1">
                                                          {detalle.fechas.map(
                                                            (
                                                              fecha: Date,
                                                              index: number,
                                                            ) => (
                                                              <span
                                                                key={index}
                                                                className="bg-gray-100 px-1.5 py-0.5 rounded"
                                                              >
                                                                {formatDateShort(
                                                                  fecha.toString(),
                                                                )}
                                                              </span>
                                                            ),
                                                          )}
                                                        </div>
                                                      )}
                                                  </div>
                                                ),
                                              )
                                            ) : (
                                              <div className="text-xs text-gray-500">
                                                No hay fechas registradas
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">
                                  No hay pernotes registrados
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Vacaciones
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.total_vacaciones)}
                        </span>
                      </div>

                      {liquidacionActual.periodo_start_vacaciones &&
                        liquidacionActual.periodo_end_vacaciones && (
                          <div className="text-xs text-gray-600 italic pl-4">
                            Período:{" "}
                            {formatDate(
                              liquidacionActual.periodo_start_vacaciones,
                            )}{" "}
                            -{" "}
                            {formatDate(
                              liquidacionActual.periodo_end_vacaciones,
                            )}
                          </div>
                        )}

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Incapacidad
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.valor_incapacidad)}
                        </span>
                      </div>

                      {liquidacionActual.periodo_start_incapacidad &&
                        liquidacionActual.periodo_end_incapacidad && (
                          <div className="text-xs text-gray-600 italic pl-4">
                            Período:{" "}
                            {formatDate(
                              liquidacionActual.periodo_start_incapacidad,
                            )}{" "}
                            -{" "}
                            {formatDate(
                              liquidacionActual.periodo_end_incapacidad,
                            )}
                          </div>
                        )}

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Ajuste Salarial
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(liquidacionActual.ajuste_salarial)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">
                            Anticipos
                          </span>
                          <button
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            onClick={() => toggleSection("anticipos")}
                          >
                            {expandedSections.anticipos ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          -{formatCurrency(liquidacionActual.total_anticipos)}
                        </span>
                      </div>

                      {/* Detalle de anticipos */}
                      {expandedSections.anticipos &&
                        liquidacionActual.anticipos &&
                        liquidacionActual.anticipos.length > 0 && (
                          <div className="pl-4 border-l-2 border-gray-200 my-2">
                            {liquidacionActual.anticipos.map(
                              (anticipo: any) => (
                                <div
                                  key={anticipo.id}
                                  className="flex justify-between text-xs my-1"
                                >
                                  <span className="text-gray-600">
                                    {anticipo.concepto || "Anticipo"}{" "}
                                    {anticipo.fecha &&
                                      `(${formatDate(anticipo.fecha)})`}
                                  </span>
                                  <span className="font-medium text-red-600">
                                    -{formatCurrency(anticipo.valor)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-emerald-600">
                          {formatCurrency(
                            liquidacionActual.sueldo_total + totalDeducciones,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">
                        Deducciones
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Salud (4%)
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(liquidacionActual.salud)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Pensión (4%)
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(liquidacionActual.pension)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span>Total Deducciones</span>
                          <span className="text-red-600">
                            {formatCurrency(totalDeducciones)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Neto a Pagar</span>
                          <span className="text-emerald-600">
                            {formatCurrency(netoAPagar)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">
                        Provisiones
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Cesantías
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(liquidacionActual.cesantias)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Interés de Cesantías
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(
                              liquidacionActual.interes_cesantias,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pestaña: Detalles */}
          {activeTab === "detalles" && (
            <>
              {/* Mantenimientos */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    MANTENIMIENTOS
                  </h4>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => toggleSection("mantenimientos")}
                  >
                    {expandedSections.mantenimientos ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!expandedSections.mantenimientos && (
                  <p className="text-sm text-gray-500">
                    {liquidacionActual.mantenimientos &&
                    liquidacionActual.mantenimientos.length > 0
                      ? `${liquidacionActual.mantenimientos.length} mantenimientos registrados`
                      : "No hay mantenimientos registrados"}
                  </p>
                )}

                {expandedSections.mantenimientos &&
                  liquidacionActual.mantenimientos &&
                  liquidacionActual.mantenimientos.some((mantenimiento) =>
                    mantenimiento.values.some((value) => value.quantity > 0),
                  ) && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              scope="col"
                            >
                              Vehículo
                            </th>
                            <th
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              scope="col"
                            >
                              Mes
                            </th>
                            <th
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              scope="col"
                            >
                              Cantidad
                            </th>
                            <th
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              scope="col"
                            >
                              Valor por mes
                            </th>
                            <th
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              scope="col"
                            >
                              Valor unitario
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(() => {
                            // Group maintenance values by vehicle and month
                            const groupedMaintenance: any = {};

                            liquidacionActual.mantenimientos.forEach((mant) => {
                              const placa = mant.vehiculo.placa;

                              mant.values.forEach((value) => {
                                // Only consider values with quantity > 0
                                if (value.quantity > 0) {
                                  // Create a unique key for each vehicle-month combination
                                  const key = `${placa}-${value.mes}`;

                                  if (!groupedMaintenance[key]) {
                                    groupedMaintenance[key] = {
                                      placa,
                                      mes: value.mes,
                                      quantity: 0,
                                      totalValue: 0,
                                    };
                                  }

                                  // Add quantity and calculate total value
                                  groupedMaintenance[key].quantity +=
                                    value.quantity;
                                  groupedMaintenance[key].totalValue +=
                                    mant.value * value.quantity;
                                }
                              });
                            });

                            // Convert to sorted array and filter out entries with zero quantity
                            return Object.values(groupedMaintenance)
                              .filter((entry: any) => entry.quantity > 0)
                              .sort((a: any, b: any) => {
                                // Sort by placa, then by month
                                if (a.placa !== b.placa) {
                                  return a.placa.localeCompare(b.placa);
                                }
                                // Assuming month format is like "Feb 2025"
                                const monthOrder = [
                                  "Ene",
                                  "Feb",
                                  "Mar",
                                  "Abr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Ago",
                                  "Sep",
                                  "Oct",
                                  "Nov",
                                  "Dic",
                                ];
                                const aMonth = a.mes.split(" ")[0];
                                const bMonth = b.mes.split(" ")[0];

                                return (
                                  monthOrder.indexOf(aMonth) -
                                  monthOrder.indexOf(bMonth)
                                );
                              })
                              .map((entry: any) => (
                                <tr
                                  key={`${entry.placa}-${entry.mes}`}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                                    {entry.placa}
                                  </td>
                                  <td className="px-3 py-2 text-xs">
                                    {entry.mes}
                                  </td>
                                  <td className="px-3 py-2 text-xs">
                                    {entry.quantity} mantenimiento
                                    {entry.quantity !== 1 ? "s" : ""}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                    {formatCurrency(entry.totalValue)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                    {formatCurrency(
                                      entry.totalValue / entry.quantity,
                                    )}
                                  </td>
                                </tr>
                              ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}

                {expandedSections.mantenimientos &&
                  (!liquidacionActual.mantenimientos ||
                    !liquidacionActual.mantenimientos.some((mantenimiento) =>
                      mantenimiento.values.some((value) => value.quantity > 0),
                    )) && (
                    <p className="text-sm text-gray-500 italic">
                      No hay mantenimientos registrados para esta liquidación.
                    </p>
                  )}
              </div>

              {/* Lista completa de Recargos */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    RECARGOS
                  </h4>
                </div>

                {liquidacionActual.recargos &&
                liquidacionActual.recargos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Mes
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Empresa
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Vehículo
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Valor
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Pago Cliente
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liquidacionActual.recargos
                          .sort((a: any, b: any) => {
                            // Primero ordenamos por vehículo (placa)
                            const placaA = a.vehiculo?.placa || "";
                            const placaB = b.vehiculo?.placa || "";

                            if (placaA !== placaB) {
                              return placaA.localeCompare(placaB);
                            }

                            // Luego ordenamos por mes
                            const mesesOrden: any = {
                              Enero: 1,
                              Febrero: 2,
                              Marzo: 3,
                              Abril: 4,
                              Mayo: 5,
                              Junio: 6,
                              Julio: 7,
                              Agosto: 8,
                              Septiembre: 9,
                              Octubre: 10,
                              Noviembre: 11,
                              Diciembre: 12,
                            };

                            const mesA = a.mes || "";
                            const mesB = b.mes || "";
                            const mesAOrden = mesesOrden[mesA] || 0;
                            const mesBOrden = mesesOrden[mesB] || 0;

                            return mesAOrden - mesBOrden;
                          })
                          .map((recargo) => (
                            <tr key={recargo.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {recargo.mes || "-"}
                              </td>
                              <td className="px-3 py-2 text-xs">
                                {recargo.empresa.Nombre}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {recargo.vehiculo
                                  ? `${recargo.vehiculo.marca} ${recargo.vehiculo.modelo} (${recargo.vehiculo.placa})`
                                  : "No asociado"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                {formatCurrency(recargo.valor)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {recargo.pag_cliente ? (
                                  <span className="text-green-600">Sí</span>
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay recargos registrados para esta liquidación.
                  </p>
                )}
              </div>

              {/* Lista completa de Pernotes */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    PERNOTES
                  </h4>
                </div>

                {liquidacionActual.pernotes &&
                liquidacionActual.pernotes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Fecha(s)
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Empresa
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Vehículo
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Cantidad
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Valor
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liquidacionActual.pernotes.map((pernote: any) => (
                          <tr key={pernote.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {pernote.fechas && pernote.fechas.length > 0 ? (
                                <div className="flex flex-col">
                                  {pernote.fechas.map(
                                    (fecha: string, index: number) => (
                                      <span key={index} className="mb-1">
                                        {formatDateShort(fecha)}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  Sin fechas
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {pernote.empresa
                                ? `${pernote.empresa.Nombre}`
                                : "No asociada"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {pernote.vehiculo
                                ? `${pernote.vehiculo.marca} ${pernote.vehiculo.modelo} (${pernote.vehiculo.placa})`
                                : "No asociado"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {pernote.cantidad || pernote.fechas?.length || 0}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                              {formatCurrency(parseFloat(pernote.valor))}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                              {formatCurrency(pernote.valor * pernote.cantidad)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay pernotes registrados para esta liquidación.
                  </p>
                )}
              </div>

              {/* Lista completa de Bonificaciones */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    BONIFICACIONES
                  </h4>
                </div>

                {liquidacionActual.bonificaciones &&
                liquidacionActual.bonificaciones.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            MES
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            CONCEPTO
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            VEHICULO
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            CANTIDAD
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            VALOR UNITARIO
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const rows: any = [];

                          // Recorremos directamente todas las bonificaciones y sus valores
                          liquidacionActual.bonificaciones.forEach(
                            (bonificacion: any) => {
                              // Obtenemos los datos del vehículo
                              const vehiculoPlaca =
                                bonificacion.vehiculo?.placa || "N/A";
                              const vehiculoModelo =
                                bonificacion.vehiculo?.modelo || "N/A";
                              const vehiculoMarca =
                                bonificacion.vehiculo?.marca || "N/A";
                              const valorUnitario = Number(bonificacion.value);

                              // Para cada bonificación, procesamos sus valores por mes
                              bonificacion.values.forEach(
                                (mesItem: {
                                  mes: string;
                                  quantity: number;
                                }) => {
                                  // Calculamos el total para esta combinación específica
                                  const total =
                                    mesItem.quantity * valorUnitario;

                                  // Agregamos una fila a la tabla
                                  rows.push(
                                    <tr
                                      key={`${bonificacion.id}-${mesItem.mes}`}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                                        {mesItem.mes}
                                      </td>
                                      <td className="px-3 py-2 text-xs">
                                        {bonificacion.name}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                                        {vehiculoMarca} {vehiculoModelo}{" "}
                                        <span>({vehiculoPlaca})</span>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                                        {mesItem.quantity}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                                        {formatCurrency(valorUnitario)}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                        {formatCurrency(total)}
                                      </td>
                                    </tr>,
                                  );
                                },
                              );
                            },
                          );

                          // Ordenamos las filas por placa, mes y concepto
                          rows.sort((a: any, b: any) => {
                            // Primero ordenamos por vehículo
                            const vehiculoA =
                              a.props.children[2].props.children[2];
                            const vehiculoB =
                              b.props.children[2].props.children[2];

                            if (vehiculoA !== vehiculoB) {
                              return vehiculoA.localeCompare(vehiculoB);
                            }

                            // Luego por mes (considerando un orden cronológico)
                            const mesesOrden: any = {
                              Enero: 1,
                              Febrero: 2,
                              Marzo: 3,
                              Abril: 4,
                              Mayo: 5,
                              Junio: 6,
                              Julio: 7,
                              Agosto: 8,
                              Septiembre: 9,
                              Octubre: 10,
                              Noviembre: 11,
                              Diciembre: 12,
                            };

                            const mesA = a.props.children[0].props.children;
                            const mesB = b.props.children[0].props.children;
                            const mesAOrden = mesesOrden[mesA] || 0;
                            const mesBOrden = mesesOrden[mesB] || 0;

                            if (mesAOrden !== mesBOrden) {
                              return mesAOrden - mesBOrden;
                            }

                            // Finalmente por concepto
                            const conceptoA =
                              a.props.children[1].props.children;
                            const conceptoB =
                              b.props.children[1].props.children;

                            return conceptoA.localeCompare(conceptoB);
                          });

                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay bonificaciones registradas para esta liquidación.
                  </p>
                )}
              </div>

              {/* Lista completa de Anticipos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    ANTICIPOS
                  </h4>
                </div>

                {liquidacionActual.anticipos &&
                liquidacionActual.anticipos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Fecha
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Concepto
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Valor
                          </th>
                          <th
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Observaciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liquidacionActual.anticipos.map((anticipo: any) => (
                          <tr key={anticipo.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                              {formatDate(anticipo.fecha)}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {anticipo.concepto || "Anticipo"}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-red-600">
                              -{formatCurrency(anticipo.valor)}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {anticipo.observaciones || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay anticipos registrados para esta liquidación.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Pestaña: Auditoría */}
          {activeTab === "auditoria" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> INFORMACIÓN DE AUDITORÍA
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Creado por</p>
                      <p className="text-sm font-medium flex items-center">
                        <User className="w-3 h-3 mr-1 text-gray-400" />
                        {creadoPor}
                      </p>
                      {liquidacionActual.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(liquidacionActual.createdAt)}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Liquidado por</p>
                      <p className="text-sm font-medium flex items-center">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                        {liquidadoPor}
                      </p>
                      {liquidacionActual.fecha_liquidacion && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(liquidacionActual.fecha_liquidacion)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        Última actualización por
                      </p>
                      <p className="text-sm font-medium flex items-center">
                        <Edit className="w-3 h-3 mr-1 text-gray-400" />
                        {actualizadoPor}
                      </p>
                      {liquidacionActual.updatedAt &&
                        liquidacionActual.actualizado_por_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(liquidacionActual.updatedAt)}
                          </p>
                        )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500">ID de liquidación</p>
                      <p className="text-sm font-medium font-mono">
                        {liquidacionActual.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <CalendarClock className="w-4 h-4 mr-2" /> PERÍODOS
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500">Período de Nómina</p>
                    <p className="text-sm font-medium">
                      {periodoInicio} - {periodoFin}
                    </p>
                  </div>

                  {liquidacionActual.periodo_start_vacaciones &&
                    liquidacionActual.periodo_end_vacaciones && (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">
                          Período de Vacaciones
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(
                            liquidacionActual.periodo_start_vacaciones,
                          )}{" "}
                          -{" "}
                          {formatDate(liquidacionActual.periodo_end_vacaciones)}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              className="rounded-md"
              color="primary"
              onPress={() => {
                handleGeneratePDF(liquidacionActual);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidacionDetalleModal;
