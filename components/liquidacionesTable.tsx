import { Liquidacion, useNomina } from '@/context/NominaContext'
import { formatCurrency, formatDate } from '@/helpers/helpers'
import { AlertCircle, ArrowUpDown, Check, Edit, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface LiquidacionesTableProps {
    requestSort: (key: string) => void;
    currentItems: Liquidacion[];
    confirmarEliminarLiquidacion: (id: string, nombre: string) => void;
    // Añadir estas propiedades
    selectedIds?: string[];
    onSelectItem?: (id: string) => void;
}


export default function LiquidacionesTable({
    requestSort,
    currentItems,
    confirmarEliminarLiquidacion,
    selectedIds = [], // Valor por defecto
    onSelectItem = () => { } // Valor por defecto
}: LiquidacionesTableProps) {

    const { abrirModalDetalle } = useNomina()
    const router = useRouter()

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                            type="checkbox"
                            checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                            onChange={() => {
                                if (selectedIds.length === currentItems.length) {
                                    // Si todos están seleccionados, deseleccionar todos
                                    currentItems.forEach(item => {
                                        if (selectedIds.includes(item.id)) {
                                            onSelectItem(item.id);
                                        }
                                    });
                                } else {
                                    // Si no todos están seleccionados, seleccionar todos
                                    currentItems.forEach(item => {
                                        if (!selectedIds.includes(item.id)) {
                                            onSelectItem(item.id);
                                        }
                                    });
                                }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('periodoStart')}
                    >
                        <div className="flex items-center">
                            Período
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('conductor')}
                    >
                        <div className="flex items-center">
                            Conductor
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('diasLaborados')}
                    >
                        <div className="flex items-center">
                            Días Lab.
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('sueldoTotal')}
                    >
                        <div className="flex items-center">
                            Monto
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('estado')}
                    >
                        <div className="flex items-center">
                            Estado
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((liquidacion) => (
                    <tr key={liquidacion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(liquidacion.id)}
                                onChange={() => onSelectItem(liquidacion.id)}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
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
                                {liquidacion.conductor?.nombre} {liquidacion.conductor?.apellido}
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
                                className={`inline-flex items-center px-2 text-xs leading-5 font-semibold rounded-full ${liquidacion.estado === 'Liquidado'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {liquidacion.estado === 'Liquidado' ? (
                                    <Check className="mr-1 h-3 w-3" />
                                ) : (
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                )}
                                {liquidacion.estado}
                            </span>
                            {liquidacion.fecha_liquidacion && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(liquidacion.fecha_liquidacion).toLocaleDateString()}
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
                                    onClick={() => router.push(`/conductores/editar/${liquidacion.id}`)}
                                >
                                    <Edit className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => confirmarEliminarLiquidacion(liquidacion.id, liquidacion.conductor?.nombre)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
