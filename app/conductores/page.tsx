"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useNomina } from "@/context/NominaContext";
import LoadingPage from "@/components/loadingPage";
import LiquidacionesTable from "@/components/liquidacionesTable";
import GenericExportButton from "@/components/genericExportButton";
import EmailSender from "@/components/emailSender";

const LiquidacionesDashboard: React.FC = () => {
  const {
    liquidaciones,
    liquidacionesFiltradas,
    loading,
    error,
    filtros,
    setFiltros,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    resetearFiltros,
    estadisticas,
    sortConfig,
    ordenarLiquidaciones,
    confirmarEliminarLiquidacion,
  } = useNomina();

  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Cálculos para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = liquidacionesFiltradas.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Funciones de paginación
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) =>
      Math.min(
        prev + 1,
        Math.ceil(liquidacionesFiltradas.length / itemsPerPage),
      ),
    );
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";

    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    ordenarLiquidaciones(key, direction);
  };

  // Función para formatear monedas
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Esta función obtiene solo las liquidaciones seleccionadas
  const getSelectedLiquidaciones = async () => {
    // Filtrar solo las liquidaciones seleccionadas
    return liquidaciones.filter((item) => selectedIds.includes(item.id));
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="flex-grow px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Panel de información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500 mb-2">
              Total Liquidaciones
            </h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-800">
                {estadisticas.total}
              </span>
              <span className="ml-2 text-sm text-gray-500">registros</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500 mb-2">
              Liquidaciones Pendientes
            </h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-amber-500">
                {estadisticas.pendientes}
              </span>
              <span className="ml-2 text-sm text-gray-500">por procesar</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500 mb-2">Monto Total</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-emerald-600">
                {formatCurrency(estadisticas.montoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Liquidaciones
            </h2>

            <div className="flex flex-col md:flex-row lg:flex-row gap-3">
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition flex items-center justify-center"
                onClick={() => router.push("/conductores/agregar")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Nueva Liquidación
              </button>

              <GenericExportButton
                buttonClassName="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition w-full"
                buttonProps={{
                  disabled: selectedIds.length === 0,
                  startContent: <Download className="w-4 h-4 mr-2" />,
                }}
                getData={getSelectedLiquidaciones}
                label={`Exportar (${selectedIds.length})`}
                options={{ filePrefix: "liquidaciones_seleccionadas" }}
              />

              <EmailSender selectedIds={selectedIds} />
            </div>
          </div>

          <div className="flex flex-col md:flex-col lg:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative flex-2">
              <label className="sr-only" htmlFor="busqueda-conductor">
                Buscar por conductor o ID
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search aria-hidden="true" className="h-5 w-5 text-gray-400" />
              </div>
              <input
                aria-describedby="busqueda-ayuda"
                className="block w-full h-12 pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                id="busqueda-conductor"
                placeholder="Buscar por conductor o ID..."
                type="text"
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros({ ...filtros, busqueda: e.target.value })
                }
              />
              <div className="sr-only" id="busqueda-ayuda">
                Escribe el nombre del conductor o ID para filtrar los resultados
              </div>
            </div>

            {/* Filtro de fecha */}
            <div className="relative flex-1">
              <label className="sr-only" htmlFor="filtro-fecha">
                Filtrar por mes y año
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                aria-describedby="fecha-ayuda"
                className="block w-full h-12 pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                id="filtro-fecha"
                type="month"
                value={
                  filtros.periodoStart
                    ? filtros.periodoStart.substring(0, 7)
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setCurrentPage(1); // Reset to first page on filter change

                  if (value) {
                    setFiltros({
                      ...filtros,
                      periodoStart: `${value}-01`,
                    });
                  } else {
                    setFiltros({
                      ...filtros,
                      periodoStart: "",
                    });
                  }
                }}
              />
              <div className="sr-only" id="fecha-ayuda">
                Selecciona un mes y año para filtrar las liquidaciones
              </div>
            </div>

            {/* Filtro de estado */}
            <div className="relative flex-1">
              <label className="sr-only" htmlFor="filtro-estado">
                Filtrar por estado de liquidación
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter aria-hidden="true" className="h-5 w-5 text-gray-400" />
              </div>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                aria-describedby="estado-ayuda"
                className="block w-full h-12 pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                id="filtro-estado"
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
              >
                <option value="">Todos los estados</option>
                <option value="Liquidado">Liquidado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 text-gray-400"
                />
              </div>
              <div className="sr-only" id="estado-ayuda">
                Selecciona un estado para filtrar las liquidaciones
              </div>
            </div>

            {/* Items per page */}
            <div className="flex-1">
              <label className="sr-only" htmlFor="itemPerPage">
                Elementos por página
              </label>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                aria-describedby="items-ayuda"
                className="block w-full h-12 py-2 px-3 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                id="itemPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  if (itemsPerPage === Number(e.target.value)) return;

                  if (itemsPerPage === liquidaciones.length) {
                    setCurrentPage(1); // Reset to first page when switching from "All"
                  } else if (
                    currentPage >
                    Math.ceil(liquidaciones.length / Number(e.target.value))
                  ) {
                    setCurrentPage(
                      Math.ceil(liquidaciones.length / Number(e.target.value)),
                    );
                  }

                  setItemsPerPage(Number(e.target.value));
                }}
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value={liquidaciones.length}>Todos</option>
              </select>
              <div className="sr-only" id="items-ayuda">
                Selecciona cuántos elementos mostrar por página
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex-1">
              <button
                aria-describedby="limpiar-ayuda"
                className="w-full h-12 px-4 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition flex items-center justify-center focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                type="button"
                onClick={resetearFiltros}
              >
                <RefreshCw aria-hidden="true" className="mr-2 w-4 h-4" />
                Limpiar filtros
              </button>
              <div className="sr-only" id="limpiar-ayuda">
                Restaurar todos los filtros a su estado inicial
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de liquidaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <LoadingPage>Obteniendo liquidaciones</LoadingPage>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <p className="mt-4 text-gray-700">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                onClick={() => window.location.reload()}
              >
                Intentar nuevamente
              </button>
            </div>
          ) : liquidacionesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No se encontraron liquidaciones con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mb-5">
              <LiquidacionesTable
                confirmarEliminarLiquidacion={confirmarEliminarLiquidacion}
                currentItems={currentItems}
                requestSort={requestSort}
                selectedIds={selectedIds}
                onSelectItem={handleSelectItem}
              />{" "}
            </div>
          )}

          {/* Paginación */}
          {!loading && !error && liquidacionesFiltradas.length > 0 && (
            <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
              {/* Desktop - Layout horizontal completo */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {indexOfFirstItem + 1} a{" "}
                  {Math.min(indexOfLastItem, liquidacionesFiltradas.length)} de{" "}
                  {liquidacionesFiltradas.length} registros
                </div>

                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    disabled={currentPage === 1}
                    onClick={prevPage}
                  >
                    Anterior
                  </button>

                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(liquidacionesFiltradas.length / itemsPerPage),
                      ),
                    },
                    (_, i) => {
                      // Lógica para mostrar páginas alrededor de la página actual
                      let pageNum;
                      const totalPages = Math.ceil(
                        liquidacionesFiltradas.length / itemsPerPage,
                      );

                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 border rounded-md ${
                            currentPage === pageNum
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => paginate(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    className={`px-3 py-1 border rounded-md ${
                      currentPage ===
                      Math.ceil(liquidacionesFiltradas.length / itemsPerPage)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    disabled={
                      currentPage ===
                      Math.ceil(liquidacionesFiltradas.length / itemsPerPage)
                    }
                    onClick={nextPage}
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet - Layout optimizado */}
              <div className="lg:hidden space-y-3">
                {/* Información de registros - Mobile */}
                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
                  Mostrando {indexOfFirstItem + 1} a{" "}
                  {Math.min(indexOfLastItem, liquidacionesFiltradas.length)} de{" "}
                  {liquidacionesFiltradas.length} registros
                </div>

                {/* Controles de paginación - Mobile */}
                <div className="flex flex-col space-y-3">
                  {/* Botones Anterior/Siguiente más prominentes */}
                  <div className="flex space-x-3">
                    <button
                      className={`flex-1 px-4 py-3 border rounded-lg font-medium transition-colors ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                      disabled={currentPage === 1}
                      onClick={prevPage}
                    >
                      ← Anterior
                    </button>

                    <button
                      className={`flex-1 px-4 py-3 border rounded-lg font-medium transition-colors ${
                        currentPage ===
                        Math.ceil(liquidacionesFiltradas.length / itemsPerPage)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                      disabled={
                        currentPage ===
                        Math.ceil(liquidacionesFiltradas.length / itemsPerPage)
                      }
                      onClick={nextPage}
                    >
                      Siguiente →
                    </button>
                  </div>

                  {/* Navegación por páginas - Solo en Tablet */}
                  <div className="hidden md:block lg:hidden">
                    <div className="flex justify-center space-x-1 overflow-x-auto py-2">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            Math.ceil(
                              liquidacionesFiltradas.length / itemsPerPage,
                            ),
                          ),
                        },
                        (_, i) => {
                          let pageNum;
                          const totalPages = Math.ceil(
                            liquidacionesFiltradas.length / itemsPerPage,
                          );

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`min-w-[44px] px-3 py-2 border rounded-md text-sm transition-colors ${
                                currentPage === pageNum
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                              }`}
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Indicador de página actual - Solo Mobile */}
                  <div className="md:hidden text-center">
                    <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm">
                      <span>Página</span>
                      <span className="font-semibold bg-emerald-600 text-white px-2 py-1 rounded text-xs">
                        {currentPage}
                      </span>
                      <span>de</span>
                      <span className="font-semibold">
                        {Math.ceil(
                          liquidacionesFiltradas.length / itemsPerPage,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidacionesDashboard;
