"use client"
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { useNotificaciones } from '@/hooks/useNotificaciones';

// Definiciones de tipos
export interface Conductor {
    id: string;
    nombre: string;
    apellido: string;
    numero_identificacion: string;
    salario_base: number;
    email: string
}

export interface Configuracion {
    id: string
    nombre: string
    valor: string
    tipo: string
    activo: string
}

export interface Empresa {
    id: string;
    nombre: string;
    NIT: string;
    Nombre: string;
    Representante: string;
    Cedula: string;
    Telefono: string;
    Direccion: string;
}

export interface Vehiculo {
    id: string;
    placa: string;
    modelo: string;
    marca: string;
}

export interface Bonificacion {
    id?: string;
    liquidacionId?: string;
    vehiculo_id: string;
    name: string;
    values: any; // Puede ser un objeto con valores específicos
    value: number;
    vehiculo: Vehiculo
}

export interface Pernote {
    id?: string;
    liquidacionId?: string;
    vehiculo_id: string;
    cantidad: number;
    valor: number;
    fechas: string[];
    vehiculo: Vehiculo
    empresa: Empresa
}

export interface Recargo {
    id?: string;
    liquidacionId?: string;
    vehiculo_id: string;
    empresa_id: string;
    valor: number;
    pag_cliente: boolean;
    mes: string;
    vehiculo: Vehiculo
    empresa: Empresa
}

export interface Anticipo {
    id?: string;
    liquidacionId: string;
    valor: number;
    fecha?: string;
}

export interface Mantenimiento {
    id?: string;
    liquidacionId?: string;
    values: [{
        mes: string,
        quantity: number
    }],
    vehiculo: Vehiculo;
    value: number,
    vehiculo_id: string,
}

export interface Liquidacion {
    id: string;
    conductor_id: string;
    conductor: Conductor;
    periodo_start: string;
    periodo_end: string;
    auxilio_transporte?: number;
    sueldo_total: number;
    salario_devengado: number;
    total_pernotes: number;
    total_bonificaciones: number;
    total_recargos: number;
    total_anticipos: number;
    total_vacaciones: number;
    periodo_start_vacaciones?: string | null;
    periodo_end_vacaciones?: string | null;
    dias_laborados: number;
    dias_laborados_villanueva: number;
    dias_laborados_anual: number;
    ajuste_salarial: number;
    salud: number;
    pension: number;
    cesantias: number;
    interes_cesantias: number;
    estado?: 'Pendiente' | 'Liquidado';
    fecha_liquidacion?: string | null;
    observaciones?: string | null;
    createdAt?: string;
    updatedAt?: string;
    vehiculos?: Vehiculo[];
    bonificaciones?: Bonificacion[];
    pernotes?: Pernote[];
    recargos?: Recargo[];
    anticipos: Anticipo[];
    mantenimientos?: Mantenimiento[];
    actualizado_por_id?: string;
    creado_por_id?: string;
    liquidado_por_id?: string;
    creadoPor: {
        id: string;
        nombre: string;
        corre: string
    }
    liquidadoPor: {
        id: string;
        nombre: string;
        corre: string
    }
    actualizadoPor: {
        id: string;
        nombre: string;
        corre: string
    }
}

export type BonificacionesAcc = {
    [key: string]: {
        name: string;
        quantity: number;
        totalValue: number;
    };
}


export interface NuevoAnticipoData {
    liquidacionId: string;
    valor: number;
}

export interface FiltrosLiquidacion {
    conductor_id: string;
    periodoStart: string;
    periodoEnd: string;
    estado: string;
    busqueda: string;
}

export interface EstadisticasLiquidacion {
    total: number;
    pendientes: number;
    liquidadas: number;
    montoTotal: number;
}

export interface EmailData {
    subject: string,
    body: string,
    recipients: string[]
}

export interface PDFBlob {
    filename: string;
    data: unknown;
}

// Interfaz para el contexto
interface NominaContextType {
    // Datos
    liquidaciones: Liquidacion[];
    liquidacionActual: Liquidacion | null;
    loading: boolean;
    error: string | null;
    filtros: FiltrosLiquidacion;
    estadisticas: EstadisticasLiquidacion;
    liquidacionesFiltradas: Liquidacion[];
    vehiculos: Vehiculo[] | null;
    conductores: Conductor[] | null;
    configuracion: Configuracion[] | null;
    empresas: Empresa[] | null;

    // Estados de modales
    showCrearModal: boolean;
    showEditarModal: boolean;
    showDetalleModal: boolean;
    sortConfig: {
        key: string;
        direction: 'asc' | 'desc';
    };
    // Métodos para API
    obtenerLiquidaciones: () => Promise<void>;
    obtenerLiquidacionPorId: (id: string) => Promise<Liquidacion | null>;
    crearLiquidacion: (data: Partial<Liquidacion>) => Promise<Liquidacion | null>;
    editarLiquidacion: (id: string, data: Partial<Liquidacion>) => Promise<Liquidacion | null>;
    registrarAnticipos: (anticipos: NuevoAnticipoData[]) => Promise<Anticipo[] | null>;
    eliminarAnticipo: (anticipoId: string) => Promise<boolean>;
    obtenerVehiculos: () => Promise<void>;
    confirmarEliminarLiquidacion: (id: string, nombre: string) => Promise<void>
    ordenarLiquidaciones: (key: string, direction: 'asc' | 'desc') => void;
    exportExcel: (options: any, getData: any) => void;
    sendsEmailsNominaConductores: (emailData: EmailData, selectedIds: string[]) => void;
    generatePDFS : (selectedIds: string[], emailData: EmailData) => void;

    // Métodos para UI
    setFiltros: React.Dispatch<React.SetStateAction<FiltrosLiquidacion>>;
    resetearFiltros: () => void;
    abrirModalCrear: () => void;
    abrirModalEditar: (id: string) => Promise<void>;
    abrirModalDetalle: (id: string) => Promise<void>;
    cerrarModales: () => void;
}

// Props para el provider
interface NominaProviderProps {
    children: ReactNode;
}

// Crear el contexto
const NominaContext = createContext<NominaContextType | undefined>(undefined);

// Proveedor del contexto
export const NominaProvider: React.FC<NominaProviderProps> = ({ children }) => {
    // Estado para mantener el token de autenticación
    // Estados para liquidaciones
    const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [conductores, setConductores] = useState<Conductor[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [configuracion, setConfiguracion] = useState<Configuracion[]>([]);
    const [liquidacionActual, setLiquidacionActual] = useState<Liquidacion | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { notificarCRUD, mostrarNotificacion } = useNotificaciones();

    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    }>({
        key: 'periodo_start',
        direction: 'desc'
    });


    // Estados para filtros y paginación
    const [filtros, setFiltros] = useState<FiltrosLiquidacion>({
        conductor_id: '',
        periodoStart: '',
        periodoEnd: '',
        estado: '',
        busqueda: ''
    });

    // Estado para manejo de modales
    const [showCrearModal, setShowCrearModal] = useState<boolean>(false);
    const [showEditarModal, setShowEditarModal] = useState<boolean>(false);
    const [showDetalleModal, setShowDetalleModal] = useState<boolean>(false);

    // Configuración de axios con token
    const apiClient = useCallback(() => {
        return axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/nomina',
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true // Esto enviará las cookies automáticamente
        });
    }, []);

    // Obtener todas las liquidaciones
    const obtenerLiquidaciones = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get('/api/nomina/conductores');

            if (response.data.success) {
                setLiquidaciones(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener liquidaciones');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error('Error al obtener liquidaciones:', err);
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // Obtener una liquidación por ID
    const obtenerLiquidacionPorId = useCallback(async (id: string): Promise<Liquidacion | null> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get(`/api/nomina/conductores/${id}`);

            if (response.data.success) {
                setLiquidacionActual(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener la liquidación');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error(`Error al obtener liquidación con ID ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const crearLiquidacion = useCallback(async (liquidacionData: Partial<Liquidacion>): Promise<Liquidacion | null> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.post('/api/nomina/conductores', liquidacionData);

            if (response.data.success) {
                // Actualizar la lista de liquidaciones
                setLiquidaciones(prevLiquidaciones => [...prevLiquidaciones, response.data.data]);
                setShowCrearModal(false);

                // Notificar éxito
                notificarCRUD('crear', 'Liquidación', true);

                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al crear la liquidación');
            }
        } catch (err: any) {
            const mensajeError = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
            setError(mensajeError);

            // Notificar error
            notificarCRUD('crear', 'Liquidación', false, mensajeError);

            console.error('Error al crear liquidación:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiClient, notificarCRUD]);

    // Editar una liquidación existente
    const editarLiquidacion = useCallback(async (id: string, liquidacionData: Partial<Liquidacion>): Promise<Liquidacion | null> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.put(`/api/nomina/conductores/${id}`, liquidacionData);

            if (response.data.success) {
                // Actualizar la lista de liquidaciones
                setLiquidaciones(prevLiquidaciones =>
                    prevLiquidaciones.map(liquidacion =>
                        liquidacion.id === id ? response.data.data : liquidacion
                    )
                );

                // Actualizar la liquidación actual si está seleccionada
                if (liquidacionActual && liquidacionActual.id === id) {
                    setLiquidacionActual(response.data.data);
                }

                setShowEditarModal(false);

                // Notificar éxito
                notificarCRUD('editar', 'Liquidación', true);

                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al editar la liquidación');
            }
        } catch (err: any) {
            const mensajeError = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
            setError(mensajeError);

            // Notificar error
            notificarCRUD('editar', 'Liquidación', false, mensajeError);

            console.error(`Error al editar liquidación con ID ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiClient, liquidacionActual, notificarCRUD]);

    const eliminarLiquidacion = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const client = apiClient();
            const response = await client.delete(`/api/nomina/conductores/${id}`);

            if (response.data.success) {
                // Eliminar la liquidación de la lista
                setLiquidaciones(prevLiquidaciones =>
                    prevLiquidaciones.filter(liquidacion => liquidacion.id !== id)
                );

                // Si la liquidación eliminada es la seleccionada actualmente, limpiar la selección
                if (liquidacionActual && liquidacionActual.id === id) {
                    setLiquidacionActual(null);
                }

                // Notificar éxito
                notificarCRUD('eliminar', 'Liquidación', true);

                return true;
            } else {
                throw new Error(response.data.message || 'Error al eliminar la liquidación');
            }
        } catch (err: any) {
            const mensajeError = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
            setError(mensajeError);

            // Notificar error
            notificarCRUD('eliminar', 'Liquidación', false, mensajeError);

            console.error(`Error al eliminar liquidación con ID ${id}:`, err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [apiClient, liquidacionActual, notificarCRUD]);

    const confirmarEliminarLiquidacion = useCallback(async (id: string, nombre?: string): Promise<void> => {
        // Si estás usando una librería de confirmación como SweetAlert2, react-confirm-alert, etc.
        // Aquí un ejemplo con una función genérica de confirmación
        const confirmar = window.confirm(
            `¿Estás seguro de que deseas eliminar la liquidación${nombre ? ` de ${nombre}` : ''}? 
            Esta acción eliminará también todos los registros relacionados (anticipos, bonificaciones, mantenimientos, pernotes y recargos).`
        );

        if (confirmar) {
            const resultado = await eliminarLiquidacion(id);
        }
    }, [eliminarLiquidacion]);

    // Registrar anticipos
    const registrarAnticipos = useCallback(async (anticiposData: NuevoAnticipoData[]): Promise<Anticipo[] | null> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.post('/liquidaciones/anticipos', { anticipos: anticiposData });

            if (response.data.success) {
                // Actualizar liquidaciones después de registrar anticipos
                await obtenerLiquidaciones();

                // Si hay una liquidación actual, actualizarla
                if (liquidacionActual) {
                    await obtenerLiquidacionPorId(liquidacionActual.id);
                }

                // Notificar éxito
                notificarCRUD('registrar', 'Anticipos', true);

                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al registrar anticipos');
            }
        } catch (err: any) {
            const mensajeError = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
            setError(mensajeError);

            // Notificar error
            notificarCRUD('registrar', 'Anticipos', false, mensajeError);

            console.error('Error al registrar anticipos:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiClient, liquidacionActual, obtenerLiquidaciones, obtenerLiquidacionPorId, notificarCRUD]);

    // Eliminar un anticipo
    const eliminarAnticipo = useCallback(async (anticipoId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.delete(`/liquidaciones/anticipos/${anticipoId}`);

            if (response.data.success) {
                // Actualizar liquidaciones después de eliminar el anticipo
                await obtenerLiquidaciones();

                // Si hay una liquidación actual, actualizarla
                if (liquidacionActual) {
                    await obtenerLiquidacionPorId(liquidacionActual.id);
                }

                // Notificar éxito
                notificarCRUD('eliminar', 'Anticipo', true);

                return true;
            } else {
                throw new Error(response.data.message || 'Error al eliminar el anticipo');
            }
        } catch (err: any) {
            const mensajeError = err.response?.data?.message || err.message || 'Error al conectar con el servidor';
            setError(mensajeError);

            // Notificar error
            notificarCRUD('eliminar', 'Anticipo', false, mensajeError);

            console.error(`Error al eliminar anticipo con ID ${anticipoId}:`, err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [apiClient, liquidacionActual, obtenerLiquidaciones, obtenerLiquidacionPorId, notificarCRUD]);

    const filtrarLiquidaciones = useCallback((): Liquidacion[] => {
        // Si no hay liquidaciones, retornar array vacío
        if (!liquidaciones || liquidaciones.length === 0) {
            return [];
        }

        // Primero filtrar las liquidaciones
        let filteredLiquidaciones = liquidaciones.filter(liquidacion => {
            // Filtro por conductor
            if (filtros.conductor_id && liquidacion.conductor_id !== filtros.conductor_id) {
                return false;
            }


            // Filtro por fecha de inicio del periodo (mes específico)
            if (filtros.periodoStart && liquidacion.periodo_start) {
                // Asegurarse que las fechas estén en formato YYYY-MM-DD
                const fechaFiltroStr = filtros.periodoStart.split('T')[0]; // Remover parte de hora si existe
                const fechaLiquidacionStr = liquidacion.periodo_start.split('T')[0];

                // Extraer año y mes directamente de los strings para evitar problemas de zona horaria
                const [anioFiltro, mesFiltro] = fechaFiltroStr.split('-').map(num => parseInt(num));
                const [anioLiquidacion, mesLiquidacion] = fechaLiquidacionStr.split('-').map(num => parseInt(num));

                // Verificar si la liquidación pertenece al mes y año específicos
                // Nota: mes en string está 1-12, mientras que en Date es 0-11
                if (mesLiquidacion !== mesFiltro || anioLiquidacion !== anioFiltro) {
                    return false;
                }
            }

            // Filtro por estado
            if (filtros.estado && liquidacion.estado !== filtros.estado) {
                return false;
            }

            // Filtro por búsqueda (texto libre)
            if (filtros.busqueda && filtros.busqueda.trim() !== '') {
                const busqueda = filtros.busqueda.toLowerCase().trim();
                const conductor = liquidacion.conductor ?
                    `${liquidacion.conductor.nombre} ${liquidacion.conductor.apellido}`.toLowerCase() : '';
                const periodoStart = liquidacion.periodo_start ? liquidacion.periodo_start.toLowerCase() : '';
                const periodoEnd = liquidacion.periodo_end ? liquidacion.periodo_end.toLowerCase() : '';
                const observaciones = liquidacion.observaciones ? liquidacion.observaciones.toLowerCase() : '';

                // Buscar en los campos relevantes
                const matchConductor = conductor.includes(busqueda);
                const matchPeriodo = periodoStart.includes(busqueda) || periodoEnd.includes(busqueda);
                const matchObservaciones = observaciones.includes(busqueda);
                const matchEstado = liquidacion.estado ? liquidacion.estado.toLowerCase().includes(busqueda) : false;

                // También buscar en vehículos si están disponibles
                let matchVehiculos = false;
                if (liquidacion.vehiculos && liquidacion.vehiculos.length > 0) {
                    matchVehiculos = liquidacion.vehiculos.some(vehiculo =>
                        vehiculo.placa?.toLowerCase().includes(busqueda) ||
                        vehiculo.marca?.toLowerCase().includes(busqueda) ||
                        vehiculo.modelo?.toString().includes(busqueda)
                    );
                }

                // Si no coincide con ningún campo, filtrar
                if (!(matchConductor || matchPeriodo || matchObservaciones || matchEstado || matchVehiculos)) {
                    return false;
                }
            }

            return true;
        });

        // Ordenar los resultados filtrados
        if (sortConfig.key) {
            filteredLiquidaciones.sort((a: any, b: any) => {
                let valorA, valorB;

                // Manejar casos especiales
                switch (sortConfig.key) {
                    case 'conductor':
                        valorA = a.conductor ? `${a.conductor.nombre} ${a.conductor.apellido}` : '';
                        valorB = b.conductor ? `${b.conductor.nombre} ${b.conductor.apellido}` : '';
                        break;
                    case 'vehiculos':
                        valorA = a.vehiculos && a.vehiculos.length > 0 ? a.vehiculos.map((v: any) => v.placa).join(', ') : '';
                        valorB = b.vehiculos && b.vehiculos.length > 0 ? b.vehiculos.map((v: any) => v.placa).join(', ') : '';
                        break;
                    case 'periodoStart':
                    case 'periodoEnd':
                        valorA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : null;
                        valorB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : null;
                        break;
                    case 'total':
                        // Si tienes un método para calcular el total, úsalo aquí
                        valorA = parseFloat(a.sueldoTotal || '0') + parseFloat(a.totalBonificaciones || '0') - parseFloat(a.totalAnticipos || '0');
                        valorB = parseFloat(b.sueldoTotal || '0') + parseFloat(b.totalBonificaciones || '0') - parseFloat(b.totalAnticipos || '0');
                        break;
                    default:
                        valorA = a[sortConfig.key];
                        valorB = b[sortConfig.key];
                        break;
                }

                // Manejar valores nulos o undefined
                if (valorA === null || valorA === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valorB === null || valorB === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

                // Ordenar
                if (valorA < valorB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valorA > valorB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredLiquidaciones;
    }, [liquidaciones, filtros, sortConfig]);

    // Define la función de ordenamiento
    const ordenarLiquidaciones = useCallback((key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
        // No necesitas hacer nada más aquí, ya que filtrarLiquidaciones usará el nuevo sortConfig
    }, []);


    // Calcular estadísticas de liquidaciones
    const calcularEstadisticas = useCallback((): EstadisticasLiquidacion => {
        const liquidacionesFiltradas = filtrarLiquidaciones();
        return {
            total: liquidacionesFiltradas.length,
            pendientes: liquidacionesFiltradas.filter(liq => liq.estado === 'Pendiente').length,
            liquidadas: liquidacionesFiltradas.filter(liq => liq.estado === 'Liquidado').length,
            montoTotal: liquidacionesFiltradas.reduce((sum, liq) => sum + (parseFloat(liq.sueldo_total.toString()) || 0), 0)
        };
    }, [filtrarLiquidaciones]);

    const obtenerVehiculos = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get('/api/flota/basicos');

            if (response.data.success) {
                setVehiculos(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener liquidaciones');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error('Error al obtener liquidaciones:', err);
        } finally {
            setLoading(false);
        }
    }, [apiClient])

    const obtenerConductores = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get('/api/conductores/basicos');

            if (response.data.success) {
                setConductores(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener liquidaciones');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error('Error al obtener liquidaciones:', err);
        } finally {
            setLoading(false);
        }
    }, [apiClient])


    const obtenerConfiguracion = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get('/api/nomina/conductores/configuracion');

            if (response.data.success) {
                setConfiguracion(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener configuracion');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error('Error al obtener configuracion:', err);
        } finally {
            setLoading(false);
        }
    }, [apiClient])

    const obtenerEmpresas = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const client = apiClient();
            const response = await client.get('/api/empresas');

            if (response.data.success) {
                setEmpresas(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener empresas');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
            console.error('Error al obtener empresas:', err);
        } finally {
            setLoading(false);
        }
    }, [apiClient])

    // Resetear filtros
    const resetearFiltros = (): void => {
        setFiltros({
            conductor_id: '',
            periodoStart: '',
            periodoEnd: '',
            estado: '',
            busqueda: ''
        });
    };

    // Manejo de modales
    const abrirModalCrear = (): void => {
        setLiquidacionActual(null);
        setShowCrearModal(true);
    };

    const abrirModalEditar = async (id: string): Promise<void> => {
        const liquidacion = await obtenerLiquidacionPorId(id);
        if (liquidacion) {
            setShowEditarModal(true);
        }
    };

    const abrirModalDetalle = async (id: string): Promise<void> => {
        const liquidacion = await obtenerLiquidacionPorId(id);
        if (liquidacion) {
            setShowDetalleModal(true);
        }
    };

    const cerrarModales = (): void => {
        setShowCrearModal(false);
        setShowEditarModal(false);
        setShowDetalleModal(false);
    };

    // Cargar liquidaciones al montar el componente o cuando cambie el token
    useEffect(() => {
        obtenerLiquidaciones()
        obtenerVehiculos()
        obtenerConductores()
        obtenerEmpresas()
        obtenerConfiguracion()
    }, []);

    const exportExcel = async (options: any, getData: any) => {
        try {
            // Obtener los datos a través de la función proporcionada
            const data = await getData();

            if (!data || (Array.isArray(data) && data.length === 0)) {
                throw new Error('No hay datos para exportar');
            }

            const client = apiClient();

            // Importante: configurar la respuesta como blob para recibir archivos binarios
            const response = await client.post('/api/export',
                { data, options },
                {
                    responseType: 'blob' // Esto es crucial para recibir archivos
                }
            );

            // Crear un objeto URL para el blob
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Generar una URL para el blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace de descarga
            const link = document.createElement('a');
            link.href = url;

            // Obtener nombre de archivo desde el header o usar predeterminado
            const contentDisposition = response.headers['content-disposition'];
            let filename = `liquidacion-${new Date().toLocaleDateString("es-CO", {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })}.xlsx`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Limpiar recursos
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('Error al exportar:', error);
            // Puedes mostrar una notificación o alerta al usuario aquí
        }
    }

    const sendsEmailsNominaConductores = async (emailData: EmailData, selectedIds: string[]) => {
        try {

            const client = apiClient();
            const response = await client.post('/api/pdf/generate', {
                liquidacionIds: selectedIds,
                emailConfig: emailData
            });

        } catch (error: any) {
            console.error('Error al enviar emails:', error);
            console.error(`Error: ${error.message || 'Error desconocido al enviar emails'}`);
        } finally {
        }
    }

    const generatePDFS = async (selectedIds: string[], emailData: EmailData) => {
        try {
            const client = apiClient();
            const response = await client.post('/api/pdf/generate', {
                liquidacionIds: selectedIds,
                emailConfig: emailData
            });
        } catch (error) {
            console.log(error)
        }
    }
    // Valor del contexto
    const value: NominaContextType = {
        // Datos
        liquidaciones,
        liquidacionActual,
        vehiculos,
        conductores,
        empresas,
        configuracion,
        loading,
        error,
        filtros,
        estadisticas: calcularEstadisticas(),
        liquidacionesFiltradas: filtrarLiquidaciones(),

        // Estados de modales
        showCrearModal,
        showEditarModal,
        showDetalleModal,
        sortConfig,
        ordenarLiquidaciones,

        // Métodos para API
        obtenerLiquidaciones,
        obtenerVehiculos,
        obtenerLiquidacionPorId,
        crearLiquidacion,
        editarLiquidacion,
        registrarAnticipos,
        eliminarAnticipo,
        confirmarEliminarLiquidacion,
        exportExcel,
        sendsEmailsNominaConductores,
        generatePDFS,

        // Métodos para UI
        setFiltros,
        resetearFiltros,
        abrirModalCrear,
        abrirModalEditar,
        abrirModalDetalle,
        cerrarModales
    };

    return (
        <NominaContext.Provider value={value}>
            {children}
        </NominaContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useNomina = (): NominaContextType => {
    const context = useContext(NominaContext);

    if (!context) {
        throw new Error('useNomina debe ser usado dentro de un NominaProvider');
    }

    return context;
};

export default NominaContext;