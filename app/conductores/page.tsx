"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
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
    resetearFiltros,
    estadisticas,
    sortConfig,
    ordenarLiquidaciones,
    confirmarEliminarLiquidacion,
  } = useNomina();

  const router = useRouter();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Estado para mostrar/ocultar filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-grow px-6 py-8">
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
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Liquidaciones
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition flex items-center justify-center"
                  onClick={() => router.push("/conductores/agregar")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nueva Liquidación
                </button>

                {/* Reemplazar el botón anidado con el componente directo */}
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

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Búsqueda */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Buscar por conductor o ID..."
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busqueda: e.target.value })
                  }
                />
              </div>

              {/* Filtros básicos */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    type="month"
                    value={
                      filtros.periodoStart
                        ? filtros.periodoStart.substring(0, 7)
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;

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
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
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
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <button
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition flex items-center justify-center"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "Ocultar filtros" : "Más filtros"}
                  {showAdvancedFilters ? (
                    <ChevronUp className="ml-2 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-2 w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="conductorSelected"
                  >
                    Conductor
                  </label>
                  <select
                    className="block w-full py-2 px-3 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    id="conductorSelected"
                    value={filtros.conductor_id}
                    onChange={(e) =>
                      setFiltros({ ...filtros, conductor_id: e.target.value })
                    }
                  >
                    <option value="">Todos los conductores</option>
                    {/* Eliminar duplicados y ordenar por nombre */}
                    {Array.from(
                      new Set(liquidaciones.map((liq) => liq.conductor?.id)),
                    )
                      .map((conductorId) => {
                        const conductor = liquidaciones.find(
                          (liq) => liq.conductor?.id === conductorId,
                        )?.conductor;

                        return conductor
                          ? {
                              id: conductorId,
                              nombre: `${conductor.nombre} ${conductor.apellido}`,
                            }
                          : null;
                      })
                      .filter(Boolean)
                      .sort((a: any, b: any) =>
                        a.nombre.localeCompare(b.nombre),
                      )
                      .map((conductor) => (
                        <option key={conductor?.id} value={conductor?.id}>
                          {conductor?.nombre}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor={"itemPerPage"}
                  >
                    Registros por página
                  </label>
                  <select
                    className="block w-full py-2 px-3 border border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    id="itemPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value="5">5 por página</option>
                    <option value="10">10 por página</option>
                    <option value="20">20 por página</option>
                    <option value="50">50 por página</option>
                    <option value={liquidaciones.length}>Todos</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    className="px-4 py-2 border border-gray-200 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition flex items-center justify-center"
                    onClick={resetearFiltros}
                  >
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de liquidaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <LoadingPage />
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
              <div className="overflow-x-auto">
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Sistema de Gestión de Nómina.
            Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LiquidacionesDashboard;
