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

import { useNomina } from "@/context/NominaContext";
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

// Componente de Paginación
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
    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual

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
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-700">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex space-x-1">
        <button
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
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
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

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

  // Filtrar liquidaciones según criterios
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

      return cumplePlaca && cumpleAno;
    });
  }, [liquidaciones, filtroPlaca, filtroAno]);

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

  // Datos para gráficos y tablas
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
            const conductor = `${liquidacion.conductor?.nombre || ""} ${liquidacion.conductor?.apellido || ""}`.trim();

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

    // Unificar por placa, nombre, valorUnitario y conductor
    const agrupado = new Map<string, ResultadoBonificacion>();

    resultado.forEach((item) => {
      const key = `${item.placa}|${item.nombre}|${item.valorUnitario}|${item.conductor}`;
      if (agrupado.has(key)) {
        const existente = agrupado.get(key)!;
        existente.cantidad += item.cantidad;
        existente.valorTotal += item.valorTotal;
        // Opcional: puedes concatenar los meses si quieres mostrar todos los meses involucrados
        // existente.mes += `, ${item.mes}`;
      } else {
        agrupado.set(key, { ...item });
      }
    });

    return Array.from(agrupado.values());
  }, [liquidacionesFiltradas, filtroPlaca, filtroMes]);

  // Para el bloque de datosRecargos
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

  // Para el bloque de datosPernotes
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

  // Datos paginados para cada pestaña
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

  // Calcular total de páginas para cada pestaña
  const totalPagesBonificaciones = Math.ceil(
    datosBonificaciones.length / itemsPerPage,
  );
  const totalPagesRecargos = Math.ceil(datosRecargos.length / itemsPerPage);
  const totalPagesPernotes = Math.ceil(datosPernotes.length / itemsPerPage);

  // Funciones para manejar cambios de página
  const handlePageChangeBonificaciones = (page: number) => {
    setCurrentPageBonificaciones(page);
  };

  const handlePageChangeRecargos = (page: number) => {
    setCurrentPageRecargos(page);
  };

  const handlePageChangePernotes = (page: number) => {
    setCurrentPagePernotes(page);
  };

  // Resetear páginas cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPageBonificaciones(1);
    setCurrentPageRecargos(1);
    setCurrentPagePernotes(1);
  }, [filtroPlaca, filtroMes, filtroAno]);

  // Datos agrupados para gráficos (estos se mantienen sin paginar)
  const bonificacionesPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosBonificaciones.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valorTotal;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({
      placa,
      total,
    }));
  }, [datosBonificaciones]);

  const recargosPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosRecargos.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valor;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({
      placa,
      total,
    }));
  }, [datosRecargos]);

  const pernotesPorPlaca = useMemo(() => {
    const agrupado: Record<string, number> = {};

    datosPernotes.forEach((item) => {
      if (!agrupado[item.placa]) {
        agrupado[item.placa] = 0;
      }
      agrupado[item.placa] += item.valorTotal;
    });

    return Object.entries(agrupado).map(([placa, total]) => ({
      placa,
      total,
    }));
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

  return (
    <div className="flex-grow px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Analisis de liquidaciones</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroPlaca"
              >
                Filtrar por Placa
              </label>
              <Select
                isClearable
                className="react-select-container"
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
                className="react-select-container"
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
                        .map((mes) => ({
                          value: mes.valor,
                          label: mes.nombre,
                        }))
                        .find((mes) => mes.value === filtroMes)
                    : { value: "", label: "Todos los meses" }
                }
                onChange={(selected) => setFiltroMes(selected?.value || "")}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroAno"
              >
                Filtrar por Año
              </label>
              <Select
                isClearable
                isSearchable
                className="react-select-container"
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

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "bonificaciones"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("bonificaciones")}
                >
                  Bonificaciones
                </button>
                <button
                  className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "recargos"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("recargos")}
                >
                  Recargos
                </button>
                <button
                  className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "pernotes"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("pernotes")}
                >
                  Pernotes
                </button>
              </nav>
            </div>
          </div>

          {activeTab === "bonificaciones" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    Bonificaciones por Vehículo
                  </h2>
                </div>
                <div className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={bonificacionesPorPlaca}
                        margin={{ top: 20, right: 20, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="placa" />
                        <YAxis
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

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">
                        Detalle de Bonificaciones
                      </h3>
                      <div className="text-sm text-gray-600">
                        Mostrando {datosBonificacionesPaginados.length} de{" "}
                        {datosBonificaciones.length} registros
                      </div>
                    </div>
                    <div className="overflow-x-auto">
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

          {activeTab === "recargos" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    Recargos por Vehículo
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-72">
                      <ResponsiveContainer height="100%" width="100%">
                        <BarChart
                          data={recargosPorPlaca}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="placa" />
                          <YAxis />
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
                            name="Total Recargos"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-72">
                      <ResponsiveContainer height="100%" width="100%">
                        <PieChart>
                          <Pie
                            cx="50%"
                            cy="50%"
                            data={recargosClientePie}
                            dataKey="value"
                            fill="#8884d8"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                            outerRadius={80}
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
                              `$${value.toLocaleString()}`,
                              "Valor",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">
                        Detalle de Recargos
                      </h3>
                      <div className="text-sm text-gray-600">
                        Mostrando {datosRecargosPaginados.length} de{" "}
                        {datosRecargos.length} registros
                      </div>
                    </div>
                    <div className="overflow-x-auto">
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
                                colSpan={5}
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

          {activeTab === "pernotes" && (
            <div>
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    Pernotes por Vehículo
                  </h2>
                </div>
                <div className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={pernotesPorPlaca}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="placa" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()}`,
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

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">
                        Detalle de Pernotes
                      </h3>
                      <div className="text-sm text-gray-600">
                        Mostrando {datosPernotePaginados.length} de{" "}
                        {datosPernotes.length} registros
                      </div>
                    </div>
                    <div className="overflow-x-auto">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
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
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Resumen de Información</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700 mb-2">
                Total Bonificaciones
              </h3>
              <p className="text-2xl font-bold">
                $
                {datosBonificaciones
                  .reduce((sum, item) => sum + item.valorTotal, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-blue-500 mt-2">
                {datosBonificaciones.length} bonificaciones en total
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-700 mb-2">
                Total Recargos
              </h3>
              <p className="text-2xl font-bold">
                $
                {datosRecargos
                  .reduce((sum, item) => sum + item.valor, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-green-500 mt-2">
                {datosRecargos.length} recargos en total
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-700 mb-2">
                Total Pernotes
              </h3>
              <p className="text-2xl font-bold">
                $
                {datosPernotes
                  .reduce((sum, item) => sum + item.valorTotal, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-yellow-500 mt-2">
                {datosPernotes.length} pernotes en total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
