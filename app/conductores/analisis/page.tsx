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

const Page = () => {
  const { liquidaciones } = useNomina();

  // Estados para filtros
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [activeTab, setActiveTab] = useState("bonificaciones");

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

      // Para el criterio de año, verificamos si la fecha inicio está en el año seleccionado
      // o si la fecha fin está en el año seleccionado
      const anoInicio = fechaInicio.getFullYear().toString();
      const anoFin = fechaFin.getFullYear().toString();
      const cumpleAno =
        !filtroAno || anoInicio === filtroAno || anoFin === filtroAno;

      // Para el filtro de placa, sólo incluimos la liquidación si contiene la placa seleccionada
      const cumplePlaca =
        !filtroPlaca ||
        liquidacion.vehiculos?.some((v) => v.placa === filtroPlaca);

      // Para el mes no usamos la fecha de la liquidación directamente
      // Lo evaluaremos después en los datos filtrados de bonificaciones, recargos y pernotes

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

        // Si hay filtro de placa y este vehículo no coincide, lo omitimos
        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;

        bonificacion.values?.forEach(
          (item: { mes: string; quantity: number }) => {
            // Si hay filtro de mes y este item no coincide, lo omitimos
            // Convertimos nombre de mes a número de mes para comparar con el filtro
            if (filtroMes) {
              const mesNumero = obtenerNumeroMes(item.mes);

              if (mesNumero !== filtroMes) return;
            }

            const valorTotal = Number(bonificacion.value) * item.quantity;

            if (item.quantity > 0) {
              resultado.push({
                placa: vehiculo.placa,
                nombre: bonificacion.name,
                mes: item.mes,
                cantidad: item.quantity,
                valorUnitario: Number(bonificacion.value),
                valorTotal: valorTotal,
                conductor:
                  `${liquidacion.conductor?.nombre || ""} ${liquidacion.conductor?.apellido || ""} `.trim(),
              });
            }
          },
        );
      });
    });

    return resultado;
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

        // Si hay filtro de placa y este vehículo no coincide, lo omitimos
        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;

        // Si hay filtro de mes y este recargo no coincide, lo omitimos
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

        // Si hay filtro de placa y este vehículo no coincide, lo omitimos
        if (!vehiculo || (filtroPlaca && vehiculo.placa !== filtroPlaca))
          return;

        // Para pernotes, verificamos las fechas para determinar el mes
        let incluirPorMes = true;

        if (filtroMes && pernote.fechas && pernote.fechas.length > 0) {
          // Asumimos que las fechas están en formato YYYY-MM-DD
          incluirPorMes = pernote.fechas.some((fecha) => {
            if (!fecha) return false;
            const parts = fecha.split("-");

            if (parts.length !== 3) return false;

            return parts[1] === filtroMes; // El mes está en la posición 1 (índice 0-based)
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
  // Datos agrupados para gráficos
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
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                id="filtroPlaca"
                value={filtroPlaca}
                onChange={(e) => setFiltroPlaca(e.target.value)}
              >
                <option value="">Todas las placas</option>
                {placas.map((placa: any) => (
                  <option key={placa} value={placa}>
                    {placa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroMes"
              >
                Filtrar por Mes
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                id="filtroMes"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                <option value="">Todos los meses</option>
                {meses.map((mes) => (
                  <option key={mes.valor} value={mes.valor}>
                    {mes.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="filtroAno"
              >
                Filtrar por Año
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                id="filtroAno"
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
              >
                <option value="">Todos los años</option>
                {anos.map((ano: any) => (
                  <option key={ano} value={ano.toString()}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`mr-6 py 4 px-1 border-b-2 font-medium text-sm ${activeTab === "bonificaciones"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } `}
                  onClick={() => setActiveTab("bonificaciones")}
                >
                  Bonificaciones
                </button>
                <button
                  className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "recargos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } `}
                  onClick={() => setActiveTab("recargos")}
                >
                  Recargos
                </button>
                <button
                  className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "pernotes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } `}
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
                          tickFormatter={(value) => `$${value.toLocaleString()}`} />
                        <Tooltip
                          formatter={(value) => [
                            `$${value.toLocaleString()} `,
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
                    <h3 className="text-lg font-medium mb-3">
                      Detalle de Bonificaciones
                    </h3>
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
                          {datosBonificaciones.length > 0 ? (
                            datosBonificaciones.map((item, index) => (
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
                              `$${value.toLocaleString()} `,
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
                              `${name}: ${(percent * 100).toFixed(0)}% `
                            }
                            labelLine={false}
                            outerRadius={80}
                          >
                            {recargosClientePie.map((entry, index) => (
                              <Cell
                                key={`cell - ${index} `}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `$${value.toLocaleString()} `,
                              "Valor",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">
                      Detalle de Recargos
                    </h3>
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
                          {datosRecargos.length > 0 ? (
                            datosRecargos.map((item, index) => (
                              <tr key={index}>
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
                            `$${value.toLocaleString()} `,
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
                    <h3 className="text-lg font-medium mb-3">
                      Detalle de Pernotes
                    </h3>
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
                          {datosPernotes.length > 0 ? (
                            datosPernotes.map((item, index) => (
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
                                  {agruparFechasConsecutivas(item.fechas).join(", ")}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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
