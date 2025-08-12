"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Select from "react-select";

import { Mantenimiento, useNomina } from "@/context/NominaContext";
import { agruparFechasConsecutivas } from "@/helpers/helpers";

const COLORS = [
  "#0088FE",
  "#059669",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface ResultadoBonificacion {
  placa: string;
  nombre: string;
  mes: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
  conductor: string;
}

interface ResultadoRecargo {
  placa: string;
  valor: number;
  pagaCliente: string;
  empresa_id: string;
  empresa_nombre: string;
  mes: string;
  conductor: string;
}

interface ResultadoPernote {
  placa: string;
  cantidad: number;
  valor: number;
  valorTotal: number;
  fechas: string[];
  conductor: string;
}

// Componente de Paginación Responsive
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const delta = window.innerWidth < 640 ? 1 : 2; // Menos páginas en móvil

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
      <div className="text-sm text-gray-700 order-2 sm:order-1">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex space-x-1 order-1 sm:order-2">
        <button
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">←</span>
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
              page === currentPage
                ? "text-blue-600 bg-blue-50 border border-blue-300"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>
    </div>
  );
};

// Componente de Card para datos en móvil
const DataCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}
  >
    <h3 className="font-medium text-gray-900 mb-3 text-sm">{title}</h3>
    {children}
  </div>
);

const Page = () => {
  const { liquidaciones } = useNomina();

  // Estados para filtros
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [activeTab, setActiveTab] = useState("bonificaciones");

  // Estados para paginación
  const [currentPageBonificaciones, setCurrentPageBonificaciones] = useState(1);
  const [currentPageRecargos, setCurrentPageRecargos] = useState(1);
  const [currentPagePernotes, setCurrentPagePernotes] = useState(1);
  const itemsPerPage = 10;

  // Obtener años y meses únicos para filtros
  const anos = useMemo(() => {
    const anosSet = new Set();

    liquidaciones?.forEach((liquidacion) => {
      if (liquidacion?.periodo_start) {
        const ano = new Date(liquidacion.periodo_start).getFullYear();

        anosSet.add(ano);
      }
    });

    return Array.from(anosSet).sort((a: any, b: any) => b - a);
  }, [liquidaciones]);

  const meses = [
    { valor: "01", nombre: "Enero" },
    { valor: "02", nombre: "Febrero" },
    { valor: "03", nombre: "Marzo" },
    { valor: "04", nombre: "Abril" },
    { valor: "05", nombre: "Mayo" },
    { valor: "06", nombre: "Junio" },
    { valor: "07", nombre: "Julio" },
    { valor: "08", nombre: "Agosto" },
    { valor: "09", nombre: "Septiembre" },
    { valor: "10", nombre: "Octubre" },
    { valor: "11", nombre: "Noviembre" },
    { valor: "12", nombre: "Diciembre" },
  ];

  // Obtener placas únicas para filtros
  const placas = useMemo(() => {
    const placasSet = new Set();

    liquidaciones?.forEach((liquidacion) => {
      liquidacion?.vehiculos?.forEach((vehiculo) => {
        if (vehiculo?.placa) {
          placasSet.add(vehiculo.placa);
        }
      });
    });

    return Array.from(placasSet).sort();
  }, [liquidaciones]);

  // [Aquí van todos los useMemo existentes para filtros y datos - mantener igual]
  const liquidacionesFiltradas = useMemo(() => {
    if (!liquidaciones?.length) return [];

    return liquidaciones.filter((liquidacion) => {
      if (!liquidacion?.periodo_start) return false;
      const fechaInicio = new Date(liquidacion.periodo_start);
      const fechaFin = new Date(liquidacion.periodo_end);
      const anoInicio = fechaInicio.getFullYear().toString();
      const anoFin = fechaFin.getFullYear().toString();
      const cumpleAno =
        !filtroAno || anoInicio === filtroAno || anoFin === filtroAno;
      const cumplePlaca =
        !filtroPlaca ||
        liquidacion.vehiculos?.some((v) => v.placa === filtroPlaca);
      const cumpleMes =
        !filtroMes ||
        liquidacion.mantenimientos?.some((mantenimiento: Mantenimiento) =>
          mantenimiento.values.some((value) => {
            const mesSeleccionado = meses.find((m) => m.valor === filtroMes);

            return value.mes === mesSeleccionado?.nombre;
          }),
        );

      return cumplePlaca && cumpleAno && cumpleMes;
    });
  }, [liquidaciones, filtroPlaca, filtroAno, filtroMes]);

  // Función para convertir nombre de mes a número
  const obtenerNumeroMes = (nombreMes: string): string => {
    const mesesMap: Record<string, string> = {
      Enero: "01",
      Febrero: "02",
      Marzo: "03",
      Abril: "04",
      Mayo: "05",
      Junio: "06",
      Julio: "07",
      Agosto: "08",
      Septiembre: "09",
      Octubre: "10",
      Noviembre: "11",
      Diciembre: "12",
    };

    return mesesMap[nombreMes] || "";
  };

  // [Mantener todos los useMemo de datos existentes...]
  const datosBonificaciones = useMemo<ResultadoBonificacion[]>(() => {
    const resultado: ResultadoBonificacion[] = [];

    liquidacionesFiltradas.forEach((liquidacion) => {
      liquidacion.bonificaciones?.forEach((bonificacion) => {
        if (!bonificacion.vehiculo_id) return;
        const vehiculo = liquidacion.vehiculos?.find(
          (v) => v.id === bonificacion.vehiculo_id,
        );

        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;
        bonificacion.values?.forEach(
          (item: { mes: string; quantity: number }) => {
            if (filtroMes) {
              const mesNumero = obtenerNumeroMes(item.mes);

              if (mesNumero !== filtroMes) return;
            }
            const valorUnitario = Number(bonificacion.value);
            const valorTotal = valorUnitario * item.quantity;
            const conductor =
              `${liquidacion.conductor?.nombre || ""} ${liquidacion.conductor?.apellido || ""}`.trim();

            if (item.quantity > 0) {
              resultado.push({
                placa: vehiculo.placa,
                nombre: bonificacion.name,
                mes: item.mes,
                cantidad: item.quantity,
                valorUnitario,
                valorTotal,
                conductor,
              });
            }
          },
        );
      });
    });
    const agrupado = new Map<string, ResultadoBonificacion>();

    resultado.forEach((item) => {
      const key = `${item.placa}|${item.nombre}|${item.valorUnitario}|${item.conductor}`;

      if (agrupado.has(key)) {
        const existente = agrupado.get(key)!;

        existente.cantidad += item.cantidad;
        existente.valorTotal += item.valorTotal;
      } else {
        agrupado.set(key, { ...item });
      }
    });

    return Array.from(agrupado.values());
  }, [liquidacionesFiltradas, filtroPlaca, filtroMes]);

  // [Incluir todos los demás useMemo existentes para datosRecargos, datosPernotes, etc...]
  const datosRecargos = useMemo<ResultadoRecargo[]>(() => {
    const resultado: ResultadoRecargo[] = [];

    liquidacionesFiltradas.forEach((liquidacion) => {
      liquidacion.recargos?.forEach((recargo) => {
        if (!recargo.vehiculo_id) return;
        const vehiculo = liquidacion.vehiculos?.find(
          (v) => v.id === recargo.vehiculo_id,
        );

        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;
        if (filtroMes) {
          const mesNumero = obtenerNumeroMes(recargo.mes);

          if (mesNumero !== filtroMes) return;
        }
        resultado.push({
          placa: vehiculo.placa,
          valor: Number(recargo.valor),
          pagaCliente: recargo.pag_cliente ? "Sí" : "No",
          empresa_id: recargo.empresa_id,
          mes: recargo.mes,
          conductor:
            `${liquidacion.conductor?.nombre || ""} ${liquidacion.conductor?.apellido || ""}`.trim(),
          empresa_nombre: recargo.empresa.nombre,
        });
      });
    });

    return resultado;
  }, [liquidacionesFiltradas, filtroPlaca, filtroMes]);

  const datosPernotes = useMemo<ResultadoPernote[]>(() => {
    const resultado: ResultadoPernote[] = [];

    liquidacionesFiltradas.forEach((liquidacion) => {
      liquidacion.pernotes?.forEach((pernote) => {
        if (!pernote.vehiculo_id) return;
        const vehiculo = liquidacion.vehiculos?.find(
          (v) => v.id === pernote.vehiculo_id,
        );

        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;
        let incluirPorMes = true;

        if (filtroMes && pernote.fechas && pernote.fechas.length > 0) {
          incluirPorMes = pernote.fechas.some((fecha) => {
            if (!fecha) return false;
            const parts = fecha.split("-");

            if (parts.length !== 3) return false;

            return parts[1] === filtroMes;
          });
          if (!incluirPorMes) return;
        }
        resultado.push({
          placa: vehiculo.placa,
          cantidad: pernote.cantidad,
          valor: Number(pernote.valor),
          valorTotal: Number(pernote.valor) * pernote.cantidad,
          fechas: pernote.fechas,
          conductor:
            `${liquidacion.conductor?.nombre || ""} ${liquidacion.conductor?.apellido || ""}`.trim(),
        });
      });
    });

    return resultado;
  }, [liquidacionesFiltradas, filtroPlaca, filtroMes]);

  // [Continúa con todos los demás useMemo y funciones existentes...]
  const datosBonificacionesPaginados = useMemo(() => {
    const startIndex = (currentPageBonificaciones - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return datosBonificaciones.slice(startIndex, endIndex);
  }, [datosBonificaciones, currentPageBonificaciones]);

  const datosRecargosPaginados = useMemo(() => {
    const startIndex = (currentPageRecargos - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return datosRecargos.slice(startIndex, endIndex);
  }, [datosRecargos, currentPageRecargos]);

  const datosPernotePaginados = useMemo(() => {
    const startIndex = (currentPagePernotes - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return datosPernotes.slice(startIndex, endIndex);
  }, [datosPernotes, currentPagePernotes]);

  const totalPagesBonificaciones = Math.ceil(
    datosBonificaciones.length / itemsPerPage,
  );
  const totalPagesRecargos = Math.ceil(datosRecargos.length / itemsPerPage);
  const totalPagesPernotes = Math.ceil(datosPernotes.length / itemsPerPage);

  const handlePageChangeBonificaciones = (page: number) =>
    setCurrentPageBonificaciones(page);
  const handlePageChangeRecargos = (page: number) =>
    setCurrentPageRecargos(page);
  const handlePageChangePernotes = (page: number) =>
    setCurrentPagePernotes(page);

  React.useEffect(() => {
    setCurrentPageBonificaciones(1);
    setCurrentPageRecargos(1);
    setCurrentPagePernotes(1);
  }, [filtroPlaca, filtroMes, filtroAno]);

  const bonificacionesPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosBonificaciones.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valorTotal;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({ placa, total }));
  }, [datosBonificaciones]);

  const recargosPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosRecargos.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valor;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({ placa, total }));
  }, [datosRecargos]);

  const pernotesPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosPernotes.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valorTotal;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({ placa, total }));
  }, [datosPernotes]);

  const recargosClientePie = useMemo(() => {
    let pagaCliente = 0;
    let noPagaCliente = 0;

    datosRecargos.forEach((item) => {
      if (item.pagaCliente === "Sí") {
        pagaCliente += item.valor;
      } else {
        noPagaCliente += item.valor;
      }
    });

    return [
      { name: "Paga cliente", value: pagaCliente },
      { name: "No paga cliente", value: noPagaCliente },
    ];
  }, [datosRecargos]);

  const totalCantidadMantenimientos = useMemo(() => {
    const nombreMesFiltro = meses.find((m) => m.valor === filtroMes)?.nombre;
    const total = liquidacionesFiltradas.reduce((totalSum, liquidacion) => {
      if (!Array.isArray(liquidacion.mantenimientos)) return totalSum;

      return (
        totalSum +
        liquidacion.mantenimientos.reduce((mntSum: number, mnt: any) => {
          const vehiculo = liquidacion.vehiculos?.find(
            (v: any) => v.id === mnt.vehiculo_id,
          );

          if (!vehiculo) return mntSum;
          const placa = vehiculo.placa;

          if (filtroPlaca && placa !== filtroPlaca) return mntSum;
          if (!Array.isArray(mnt.values)) return mntSum;

          return (
            mntSum +
            mnt.values.reduce((valSum: number, val: any) => {
              const cantidad = Number(val.quantity) || 0;

              if (cantidad === 0) return valSum;
              const mes = val.mes || "";

              if (filtroMes && mes !== nombreMesFiltro) return valSum;

              return valSum + cantidad;
            }, 0)
          );
        }, 0)
      );
    }, 0);

    return total;
  }, [liquidacionesFiltradas, filtroMes, filtroPlaca]);

  return (
    <div className="flex-grow px-3 sm:px-6 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Análisis de liquidaciones
          </h1>

          {/* Filtros - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroPlaca"
              >
                Filtrar por Placa
              </label>
              <Select
                isClearable
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                id="filtroPlaca"
                options={[
                  { value: "", label: "Todas las placas" },
                  ...placas.map((placa: any) => ({
                    value: placa,
                    label: placa,
                  })),
                ]}
                placeholder="Buscar placa..."
                value={
                  filtroPlaca
                    ? { value: filtroPlaca, label: filtroPlaca }
                    : { value: "", label: "Todas las placas" }
                }
                onChange={(selected) => setFiltroPlaca(selected?.value || "")}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroMes"
              >
                Filtrar por Mes
              </label>
              <Select
                isClearable
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                id="filtroMes"
                options={[
                  { value: "", label: "Todos los meses" },
                  ...meses.map((mes) => ({
                    value: mes.valor,
                    label: mes.nombre,
                  })),
                ]}
                placeholder="Buscar mes..."
                value={
                  filtroMes
                    ? meses
                        .map((mes) => ({ value: mes.valor, label: mes.nombre }))
                        .find((mes) => mes.value === filtroMes)
                    : { value: "", label: "Todos los meses" }
                }
                onChange={(selected) => setFiltroMes(selected?.value || "")}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroAno"
              >
                Filtrar por Año
              </label>
              <Select
                isClearable
                isSearchable
                className="react-select-container text-sm"
                classNamePrefix="react-select"
                id="filtroAno"
                options={[
                  { value: "", label: "Todos los años" },
                  ...anos.map((ano: any) => ({
                    value: ano.toString(),
                    label: ano.toString(),
                  })),
                ]}
                placeholder="Buscar año..."
                value={
                  filtroAno
                    ? { value: filtroAno, label: filtroAno }
                    : { value: "", label: "Todos los años" }
                }
                onChange={(selected) => setFiltroAno(selected?.value || "")}
              />
            </div>
          </div>

          {/* Tabs - Responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {[
                  { key: "bonificaciones", label: "Bonificaciones" },
                  { key: "recargos", label: "Recargos" },
                  { key: "pernotes", label: "Pernotes" },
                  { key: "mantenimientos", label: "Mantenimientos" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`mr-4 sm:mr-6 py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido de Bonificaciones */}
          {activeTab === "bonificaciones" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Bonificaciones por Vehículo
                  </h2>
                </div>
                <div className="p-3 sm:p-4">
                  {/* Gráfico responsivo */}
                  <div className="h-64 sm:h-72 mb-4 sm:mb-6">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={bonificacionesPorPlaca}
                        margin={{
                          top: 20,
                          right: window.innerWidth < 640 ? 10 : 20,
                          left: window.innerWidth < 640 ? 20 : 50,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="placa"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                        />
                        <YAxis
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                          tickFormatter={(value) =>
                            `$${value.toLocaleString()}`
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
                            "Total",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="total"
                          fill="#059669"
                          name="Total Bonificaciones"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla/Cards responsivos */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                      <h3 className="text-base sm:text-lg font-medium">
                        Detalle de Bonificaciones
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Mostrando {datosBonificacionesPaginados.length} de{" "}
                        {datosBonificaciones.length} registros
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {datosBonificacionesPaginados.length > 0 ? (
                        datosBonificacionesPaginados.map((item, index) => (
                          <DataCard
                            key={index}
                            title={`${item.placa} - ${item.nombre}`}
                          >
                            <div className="space-y-2 text-sm">
                              <div className="flex flex-wrap justify-between items-center">
                                <span className="text-gray-600">
                                  Conductor:
                                </span>
                                <span className="font-medium break-words max-w-[60%] text-right">
                                  {item.conductor}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mes:</span>
                                <span>{item.mes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cantidad:</span>
                                <span>{item.cantidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Valor unitario:
                                </span>
                                <span>
                                  ${item.valorUnitario.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600 font-medium">
                                  Total:
                                </span>
                                <span className="font-bold text-green-600">
                                  ${item.valorTotal.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </DataCard>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay datos disponibles
                        </div>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Placa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Conductor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor Unitario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {datosBonificacionesPaginados.length > 0 ? (
                            datosBonificacionesPaginados.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.placa}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.conductor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.mes}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.cantidad}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${item.valorUnitario.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${item.valorTotal.toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                colSpan={7}
                              >
                                No hay datos disponibles
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPageBonificaciones}
                      totalPages={totalPagesBonificaciones}
                      onPageChange={handlePageChangeBonificaciones}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Recargos */}
          {activeTab === "recargos" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Recargos por Vehículo
                  </h2>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Gráfico de barras */}
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer height="100%" width="100%">
                        <BarChart
                          data={recargosPorPlaca}
                          margin={{
                            top: 20,
                            right: window.innerWidth < 640 ? 10 : 30,
                            left: window.innerWidth < 640 ? 10 : 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="placa"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                          />
                          <YAxis fontSize={window.innerWidth < 640 ? 10 : 12} />
                          <Tooltip
                            formatter={(value) => [
                              `${value.toLocaleString()}`,
                              "Total",
                            ]}
                          />
                          <Legend />
                          <Bar
                            dataKey="total"
                            fill="#059669"
                            name="Total Recargos"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Gráfico circular */}
                    <div className="h-64 sm:h-72">
                      <ResponsiveContainer height="100%" width="100%">
                        <PieChart>
                          <Pie
                            cx="50%"
                            cy="50%"
                            data={recargosClientePie}
                            dataKey="value"
                            fill="#8884d8"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                            outerRadius={window.innerWidth < 640 ? 60 : 80}
                          >
                            {recargosClientePie.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value.toLocaleString()}`,
                              "Valor",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tabla/Cards de recargos */}
                  <div className="mt-4 sm:mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                      <h3 className="text-base sm:text-lg font-medium">
                        Detalle de Recargos
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Mostrando {datosRecargosPaginados.length} de{" "}
                        {datosRecargos.length} registros
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {datosRecargosPaginados.length > 0 ? (
                        datosRecargosPaginados.map((item, index) => (
                          <DataCard
                            key={index}
                            className={
                              item.pagaCliente === "No"
                                ? "border-red-200 bg-red-50"
                                : ""
                            }
                            title={`${item.placa} - ${item.empresa_nombre}`}
                          >
                            <div className="space-y-2 text-sm">
                              <div className="flex flex-wrap justify-between items-center">
                                <span className="text-gray-600">
                                  Conductor:
                                </span>
                                <span className="font-medium break-words max-w-[60%] text-right">
                                  {item.conductor}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mes:</span>
                                <span>{item.mes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Paga cliente:
                                </span>
                                <span
                                  className={`font-medium ${item.pagaCliente === "Sí" ? "text-green-600" : "text-red-600"}`}
                                >
                                  {item.pagaCliente}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600 font-medium">
                                  Valor:
                                </span>
                                <span className="font-bold">
                                  ${item.valor.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </DataCard>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay datos disponibles
                        </div>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Placa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Conductor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Paga Cliente
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {datosRecargosPaginados.length > 0 ? (
                            datosRecargosPaginados.map((item, index) => (
                              <tr
                                key={index}
                                className={`${item.pagaCliente === "No" ? "bg-red-50" : ""}`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.placa}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.conductor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.empresa_nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.mes}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${item.valor.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.pagaCliente}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                colSpan={6}
                              >
                                No hay datos disponibles
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPageRecargos}
                      totalPages={totalPagesRecargos}
                      onPageChange={handlePageChangeRecargos}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Pernotes */}
          {activeTab === "pernotes" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Pernotes por Vehículo
                  </h2>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="h-64 sm:h-72 mb-4 sm:mb-6">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={pernotesPorPlaca}
                        margin={{
                          top: 20,
                          right: window.innerWidth < 640 ? 10 : 30,
                          left: window.innerWidth < 640 ? 10 : 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="placa"
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                        />
                        <YAxis fontSize={window.innerWidth < 640 ? 10 : 12} />
                        <Tooltip
                          formatter={(value) => [
                            `${value.toLocaleString()}`,
                            "Total",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="total"
                          fill="#FFBB28"
                          name="Total Pernotes"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla/Cards de pernotes */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                      <h3 className="text-base sm:text-lg font-medium">
                        Detalle de Pernotes
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Mostrando {datosPernotePaginados.length} de{" "}
                        {datosPernotes.length} registros
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {datosPernotePaginados.length > 0 ? (
                        datosPernotePaginados.map((item, index) => (
                          <DataCard
                            key={index}
                            title={`${item.placa} - ${item.conductor}`}
                          >
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cantidad:</span>
                                <span>{item.cantidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Valor unitario:
                                </span>
                                <span>
                                  ${Number(item.valor).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600 font-medium">
                                  Total:
                                </span>
                                <span className="font-bold text-yellow-600">
                                  ${item.valorTotal.toLocaleString()}
                                </span>
                              </div>
                              <div className="border-t pt-2">
                                <span className="text-gray-600 font-medium">
                                  Fechas:
                                </span>
                                <p className="text-xs mt-1 break-words">
                                  {agruparFechasConsecutivas(item.fechas).join(
                                    ", ",
                                  )}
                                </p>
                              </div>
                            </div>
                          </DataCard>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay datos disponibles
                        </div>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Placa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Conductor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor Unitario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fechas
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {datosPernotePaginados.length > 0 ? (
                            datosPernotePaginados.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.placa}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.conductor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.cantidad}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${Number(item.valor).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${item.valorTotal.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-500 max-w-md break-words">
                                  {agruparFechasConsecutivas(item.fechas).join(
                                    ", ",
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                colSpan={6}
                              >
                                No hay datos disponibles
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      currentPage={currentPagePernotes}
                      totalPages={totalPagesPernotes}
                      onPageChange={handlePageChangePernotes}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Mantenimientos */}
          {activeTab === "mantenimientos" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Cantidad de Mantenimientos por Vehículo
                  </h2>
                </div>
                <div className="p-3 sm:p-4">
                  {/* Mobile Cards para mantenimientos */}
                  <div className="md:hidden space-y-3">
                    {(() => {
                      type Row = {
                        placa: string;
                        conductor: string;
                        mes: string;
                        cantidad: number;
                      };
                      const agrupado = new Map<string, Row>();
                      const nombreMesFiltro = meses.find(
                        (m) => m.valor === filtroMes,
                      )?.nombre;

                      liquidacionesFiltradas.forEach((liq) => {
                        const conductor =
                          `${liq.conductor?.nombre || ""} ${liq.conductor?.apellido || ""}`.trim();

                        if (!Array.isArray(liq.mantenimientos)) return;

                        liq.mantenimientos.forEach((mnt: any) => {
                          const vehiculo = liq.vehiculos?.find(
                            (v: any) => v.id === mnt.vehiculo_id,
                          );

                          if (!vehiculo) return;
                          const placa = vehiculo.placa;

                          if (filtroPlaca && placa !== filtroPlaca) return;
                          if (!Array.isArray(mnt.values)) return;

                          mnt.values.forEach((val: any) => {
                            const cantidad = Number(val.quantity) || 0;

                            if (cantidad === 0) return;
                            const mes = val.mes || "";

                            if (filtroMes && mes !== nombreMesFiltro) return;

                            const key = `${placa}|${conductor}|${mes}`;

                            if (agrupado.has(key)) {
                              agrupado.get(key)!.cantidad += cantidad;
                            } else {
                              agrupado.set(key, {
                                placa,
                                conductor,
                                mes,
                                cantidad,
                              });
                            }
                          });
                        });
                      });

                      const rows = Array.from(agrupado.values()).filter(
                        (item) => item.cantidad > 0,
                      );

                      if (rows.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            No hay datos disponibles
                          </div>
                        );
                      }

                      return rows.map((item, idx) => (
                        <DataCard
                          key={idx}
                          title={`${item.placa} - ${item.conductor}`}
                        >
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Mes:</span>
                              <span>{item.mes}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600 font-medium">
                                Cantidad:
                              </span>
                              <span className="font-bold text-purple-600">
                                {item.cantidad}
                              </span>
                            </div>
                          </div>
                        </DataCard>
                      ));
                    })()}
                  </div>

                  {/* Desktop Table para mantenimientos */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Placa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conductor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          type Row = {
                            placa: string;
                            conductor: string;
                            mes: string;
                            cantidad: number;
                          };
                          const agrupado = new Map<string, Row>();
                          const nombreMesFiltro = meses.find(
                            (m) => m.valor === filtroMes,
                          )?.nombre;

                          liquidacionesFiltradas.forEach((liq) => {
                            const conductor =
                              `${liq.conductor?.nombre || ""} ${liq.conductor?.apellido || ""}`.trim();

                            if (!Array.isArray(liq.mantenimientos)) return;

                            liq.mantenimientos.forEach((mnt: any) => {
                              const vehiculo = liq.vehiculos?.find(
                                (v: any) => v.id === mnt.vehiculo_id,
                              );

                              if (!vehiculo) return;
                              const placa = vehiculo.placa;

                              if (filtroPlaca && placa !== filtroPlaca) return;
                              if (!Array.isArray(mnt.values)) return;

                              mnt.values.forEach((val: any) => {
                                const cantidad = Number(val.quantity) || 0;

                                if (cantidad === 0) return;
                                const mes = val.mes || "";

                                if (filtroMes && mes !== nombreMesFiltro)
                                  return;

                                const key = `${placa}|${conductor}|${mes}`;

                                if (agrupado.has(key)) {
                                  agrupado.get(key)!.cantidad += cantidad;
                                } else {
                                  agrupado.set(key, {
                                    placa,
                                    conductor,
                                    mes,
                                    cantidad,
                                  });
                                }
                              });
                            });
                          });

                          const rows = Array.from(agrupado.values()).filter(
                            (item) => item.cantidad > 0,
                          );

                          if (rows.length === 0) {
                            return (
                              <tr>
                                <td
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                  colSpan={4}
                                >
                                  No hay datos disponibles
                                </td>
                              </tr>
                            );
                          }

                          return rows.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.placa}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.conductor}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.mes}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.cantidad}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de Información - Responsive Grid */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Resumen de Información
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-sm sm:text-lg font-medium text-blue-700 mb-2">
                Total Bonificaciones
              </h3>
              <p className="text-lg sm:text-2xl font-bold">
                $
                {datosBonificaciones
                  .reduce((sum, item) => sum + item.valorTotal, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-blue-500 mt-2">
                {datosBonificaciones.length} bonificaciones en total
              </p>
            </div>

            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-sm sm:text-lg font-medium text-green-700 mb-2">
                Total Recargos
              </h3>
              <p className="text-lg sm:text-2xl font-bold">
                $
                {datosRecargos
                  .reduce((sum, item) => sum + item.valor, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-green-500 mt-2">
                {datosRecargos.length} recargos en total
              </p>
            </div>

            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-sm sm:text-lg font-medium text-yellow-700 mb-2">
                Total Pernotes
              </h3>
              <p className="text-lg sm:text-2xl font-bold">
                $
                {datosPernotes
                  .reduce((sum, item) => sum + item.valorTotal, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-yellow-500 mt-2">
                {datosPernotes.length} pernotes en total
              </p>
            </div>

            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm sm:text-lg font-medium text-purple-700 mb-2 flex items-center">
                  Total Mantenimientos
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-800">
                  {totalCantidadMantenimientos}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-purple-500 mt-2">
                Mantenimientos realizados en total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
