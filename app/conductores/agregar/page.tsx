"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Save, Plus, Trash,
  CheckCircle, AlertCircle, FilePlus, Calendar, User, Truck, DollarSign
} from 'lucide-react';
import { useNomina } from '@/context/NominaContext';
import SelectReact, { ActionMeta, CSSObjectWithLabel, MultiValue } from 'react-select';
import { DatePicker } from '@nextui-org/react';
import { Input } from '@nextui-org/input';
import { Select, SelectItem } from '@nextui-org/select';
import { Checkbox } from '@nextui-org/checkbox';
import { Card } from '@nextui-org/card';
import { Divider } from '@nextui-org/divider';
import { Button } from '@nextui-org/button';
import { Tabs, Tab } from '@nextui-org/tabs';
import { Tooltip } from '@nextui-org/tooltip';
import { Badge } from '@nextui-org/badge';
import { formatCurrency, formatToCOP, formatDate, obtenerMesesEntreFechas, obtenerDiferenciaDias, dateToDateValue } from '@/helpers/helpers';
import { useRouter } from 'next/navigation';
import { AnyCalendarDate, parseDate } from '@internationalized/date';
import { DateRangePicker, CalendarDate } from '@nextui-org/react';
import { 
  createCalendar 
} from '@internationalized/date';
import { DateValue } from '@nextui-org/system/node_modules/@internationalized/date/dist/types';
import { RangeValue } from '@react-types/shared';

interface Pernote {
  vehiculo_id?: string;  // Haciendo opcional la propiedad original
  vehiculoId?: string;            // Añadiendo la nueva propiedad
  empresa?: string;
  cantidad: number;
  fechas?: string[]; // or whatever type your dates are
  [key: string]: any; // allows dynamic field updates
}

interface Recargo {
  id?: string
  empresa_id: string;
  valor: number;
  pag_cliente: boolean;
  vehiculo_id: string;
  mes: string
  // Agrega aquí las propiedades adicionales de recargos
}

type PeriodoVacaciones = {
  start: AnyCalendarDate | null;
  end: AnyCalendarDate | null;
};


interface VehiculoDetalle {
  vehiculo: {
    value: string;
    label: string;
  };
  bonos: {
    name: string;
    values: any[]; // Array de valores
    value: number; // Puede ser string o number
    vehiculoId: string;
  }[];
  mantenimientos: {
    values: { mes: string; quantity: number; }[];
    value: number;
    vehiculo_id?: string;  // Opcional
    vehiculoId?: string;   // Alternativa
  }[];
  pernotes: Pernote[];
  recargos: Recargo[];
}

// Tipo para el estado de detallesVehiculos
type DetallesVehiculos = VehiculoDetalle[];

const normalizeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function convertToDateValue(calendarDate: CalendarDate | null): DateValue | null {
  if (!calendarDate) return null;
  
  try {
    // Manually create a new DateValue using the same date components
    return createCalendar(
      calendarDate.year, 
      calendarDate.month, 
      calendarDate.day
    ) as unknown as DateValue;
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
}

// Utility function to convert PeriodoVacaciones to RangeValue<DateValue>
function convertToDateRangeValue(periodo: PeriodoVacaciones | null): RangeValue<DateValue> | null {
  if (!periodo || !periodo.start || !periodo.end) return null;

  return {
    start: convertToDateValue(periodo.start),
    end: convertToDateValue(periodo.end)
  };
}

const LiquidacionPage = ({ mode = 'create' }) => {
  const {
    liquidacionActual,
    obtenerLiquidaciones,
    crearLiquidacion,
    editarLiquidacion,
    conductores,
    vehiculos,
    configuracion,
    empresas
  } = useNomina();
  const router = useRouter();

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [activeTab, setActiveTab] = useState('datos');

  // Estados para datos del formulario
  const [conductorSelected, setConductorSelected] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [vehiculosSelected, setVehiculosSelected] = useState<Array<{
    value: string;
    label: string;
  }>>([]);
  // Using the CalendarDate type that your library expects
  const [dateSelected, setDateSelected] = useState<RangeValue<DateValue> | null>(null);
  const [periodoVacaciones, setPeriodoVacaciones] = useState<PeriodoVacaciones | null>(null);
  const [mesesRange, setMesesRange] = useState<string[]>([]);
  const [detallesVehiculos, setDetallesVehiculos] = useState<DetallesVehiculos>([]);

  // Estados para cálculos
  const [isCheckedAjuste, setIsCheckedAjuste] = useState(false);
  const [isVacaciones, setIsVacaciones] = useState(false);
  const [isCesantias, setIsCesantias] = useState(false);
  const [diasLaborados, setDiasLaborados] = useState(0);
  const [diasLaboradosVillanueva, setDiasLaboradosVillanueva] = useState(0);
  const [diasLaboradosAnual, setDiasLaboradosAnual] = useState(0);
  const [cesantias, setCesantias] = useState(0);
  const [interesCesantias, setInteresCesantias] = useState(0);
  const [ajustePorDia, setAjustePorDia] = useState(0);

  // Opciones para selectores
  const conductoresOptions = React.useMemo(
    () => conductores?.map((conductor) => ({
      value: conductor.id,
      label: `${conductor.nombre} ${conductor.apellido}`,
    })) || [],
    [conductores]
  );

  const vehiculosOptions = React.useMemo(
    () => vehiculos?.sort((a, b) => a.placa.localeCompare(b.placa)).map((vehiculo) => ({
      value: vehiculo.id,
      label: vehiculo.placa,
    })) || [],
    [vehiculos]
  );

  const empresasOptions = React.useMemo(
    () => empresas?.map((empresa) => ({
      value: empresa.id,
      label: empresa.Nombre,
    })) || [],
    [empresas]
  );

  // Estilos para componentes Select
  const selectStyles = {
    control: (base: CSSObjectWithLabel) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#E2E8F0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#CBD5E0'
      }
    }),
    menu: (base: CSSObjectWithLabel) => ({
      ...base,
      zIndex: 9999  // Aumenta este valor a uno mucho más alto
    }),
    option: (base: CSSObjectWithLabel, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#10a372' : state.isFocused ? '#ecfdf5' : 'white',
      color: state.isSelected ? 'white' : '#1F2937'
    }),
    // Añade este para asegurar que el menú siempre esté en el frente
    menuPortal: (base: CSSObjectWithLabel) => ({
      ...base,
      zIndex: 9999
    })
  };

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (mode === 'edit' && liquidacionActual) {
      cargarDatosLiquidacion();
    }
  }, [mode, liquidacionActual, conductoresOptions, vehiculosOptions]);

  // Función para cargar datos de liquidación existente
  const cargarDatosLiquidacion = () => {
    // Cargar conductor
    setConductorSelected(conductoresOptions.find(
      option => option.value === liquidacionActual?.conductor_id
    ) || null);

    // Cargar vehículos
    setVehiculosSelected(vehiculosOptions.filter(option =>
      liquidacionActual?.vehiculos?.some(vehiculo => vehiculo.id === option.value)
    ));

    // Cargar fechas
    if (liquidacionActual?.periodoStart && liquidacionActual?.periodoEnd) {
      setDateSelected({
        start: parseDate(liquidacionActual.periodoStart),
        end: parseDate(liquidacionActual.periodoEnd),
      });

      // Actualizar meses
      const nuevosMeses = obtenerMesesEntreFechas(
        liquidacionActual.periodoStart,
        liquidacionActual.periodoEnd
      )
      setMesesRange(nuevosMeses);
    }

    // Cargar vacaciones
    if (liquidacionActual?.periodoStartVacaciones && liquidacionActual?.periodoEndVacaciones) {
      setPeriodoVacaciones({
        start: parseDate(liquidacionActual.periodoStartVacaciones),
        end: parseDate(liquidacionActual.periodoEndVacaciones),
      });
    }

    // Cargar detalles de vehículos (implementación simplificada)
    if (liquidacionActual?.vehiculos && liquidacionActual.vehiculos.length > 0) {
      const detalles = liquidacionActual?.vehiculos?.map(vehiculo => ({
        vehiculo: {
          value: vehiculo.id,
          label: vehiculo.placa,
        },
        bonos: (liquidacionActual.bonificaciones || [])
          .filter(b => b.vehiculoId === vehiculo.id)
          .map(bono => ({
            name: bono.name,
            values: bono.values || [{ mes: "Mes no definido", quantity: 0 }],
            value: normalizeNumber(bono.value),
            vehiculoId: bono.vehiculoId
          })),
        mantenimientos: (liquidacionActual?.mantenimientos || [])
          .filter(m => m.vehiculo_id === vehiculo.id)
          .map(m => ({
            values: m.values || [{ mes: "Mes no definido", quantity: 0 }],
            value: normalizeNumber(m.value),
            vehiculo_id: m.vehiculo_id
          })),
        pernotes: (liquidacionActual.pernotes || []).filter(p => p.vehiculo_id === vehiculo.id),
        recargos: (liquidacionActual.recargos || [])
          .filter(r => r.vehiculo_id === vehiculo.id)
          .map(r => ({
            ...r,
            empresa_id: r.empresa_id || '',  // Añadir propiedad si no existe
            pagCliente: r.pagCliente || false // Añadir propiedad si no existe
          }))
      }));

      setDetallesVehiculos(detalles);
    }

    // Cargar otros valores
    setDiasLaborados(liquidacionActual?.diasLaborados || 0);
    setDiasLaboradosVillanueva(liquidacionActual?.diasLaboradosVillanueva || 0);
    setDiasLaboradosAnual(liquidacionActual?.diasLaboradosAnual || 0);
    setCesantias(liquidacionActual?.cesantias || 0);
    setInteresCesantias(liquidacionActual?.interesCesantias || 0);
    setIsCheckedAjuste((liquidacionActual?.ajusteSalarial ?? 0) > 0);
    setIsCheckedAjuste((liquidacionActual?.totalVacaciones ?? 0) > 0);
    setIsCesantias(
      (liquidacionActual?.cesantias ?? 0) > 0 ||
      (liquidacionActual?.interesCesantias ?? 0) > 0
    );
  };

  // Actualizar mesesRange cuando cambian las fechas
  useEffect(() => {
    if (dateSelected?.start && dateSelected?.end) {
      const formatDateValue = (date: { year: number; month: number; day: number }) => {
        return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      };

      const nuevosMeses = obtenerMesesEntreFechas(
        formatDateValue(dateSelected.start),
        formatDateValue(dateSelected.end)
      );

      if (JSON.stringify(nuevosMeses) !== JSON.stringify(mesesRange)) {
        setMesesRange(nuevosMeses);
      }
    }
  }, [dateSelected]);

  // Actualizar detallesVehiculos cuando cambian vehículos o meses
  useEffect(() => {
    if (vehiculosSelected.length > 0 && mesesRange.length > 0) {
      // Crear mapa de detalles existentes para referencia rápida
      const detallesMap = new Map(
        detallesVehiculos.map(detalle => [detalle.vehiculo.value, detalle])
      );

      // Generar nuevos detalles para cada vehículo seleccionado
      const nuevosDetalles = vehiculosSelected.map(vehiculo => {
        const detalleExistente = detallesMap.get(vehiculo.value);

        // Si ya existe el detalle, actualizar con nuevos meses
        if (detalleExistente) {
          return {
            ...detalleExistente,
            bonos: detalleExistente.bonos.map(bono => ({
              ...bono,
              value: Number(configuracion?.find(config => config.nombre === bono.name)?.valor || 0),
              values: mesesRange.map(mes => {
                const bonoExistente = bono.values.find((val: { mes: string, quantity: number }) => val.mes === mes);
                return bonoExistente || { mes, quantity: 0 };
              }),
            })),
            mantenimientos: detalleExistente.mantenimientos.length > 0
              ? detalleExistente.mantenimientos.map(mantenimiento => ({
                ...mantenimiento,
                value: configuracion?.find(config => config.nombre === "Mantenimiento")?.valor || 0,
                values: mesesRange.map(mes => {
                  const mantenimientoExistente = mantenimiento.values.find(val => val.mes === mes);
                  return mantenimientoExistente || { mes, quantity: 0 };
                }),
              }))
              : [{
                value: configuracion?.find(config => config.nombre === "Mantenimiento")?.valor || 0,
                values: mesesRange.map(mes => ({ mes, quantity: 0 })),
                vehiculoId: vehiculo.value
              }],
          };
        }

        // Si no existe, crear nuevo detalle con nombres de bonos predefinidos
        const bonos = [
          "Bono de alimentación",
          "Bono día trabajado",
          "Bono día trabajado doble",
          "Bono festividades"
        ].map(nombre => ({
          name: nombre,
          values: mesesRange.map(mes => ({ mes, quantity: 0 })),
          value: configuracion?.find(config => config.nombre === nombre)?.valor || 0,
          vehiculoId: vehiculo.value,
        }));

        return {
          vehiculo,
          bonos,
          mantenimientos: [{
            value: Number(configuracion?.find(config => config.nombre === "Mantenimiento")?.valor || 0),
            values: mesesRange.map(mes => ({ mes, quantity: 0 })),
            vehiculo_id: vehiculo.value
          }],
          pernotes: [],
          recargos: [],
        };
      });

      setDetallesVehiculos(nuevosDetalles);
    }
  }, [vehiculosSelected, mesesRange, configuracion]);

  // Manejadores de eventos
  const handleDateChange = (value: RangeValue<DateValue> | null) => {
    if (value === null) {
      // Explicitly set to null, which matches the state type
      setDateSelected(null);
    } else {
      // Create a new RangeValue object
      setDateSelected({
        start: value.start,
        end: value.end
      });
    }
  };

  const handleDateVacacionesChange = (value: RangeValue<DateValue> | null) => {
    if (value === null) {
      setPeriodoVacaciones(null);
    } else {
      setPeriodoVacaciones({
        start: value.start ? { toString: () => value.start.toString() } as AnyCalendarDate : null,
        end: value.end ? { toString: () => value.end.toString() } as AnyCalendarDate : null
      });
    }
  };

  const handleVehiculoSelect = (
    newValue: MultiValue<{ value: string; label: string; }>, 
    actionMeta: ActionMeta<{ value: string; label: string; }>
  ) => {
    // Convert MultiValue to an array
    const selected = Array.isArray(newValue) 
      ? newValue 
      : newValue ? [newValue] : [];
    
    setVehiculosSelected(selected);
  };

  // Manejo de cambios en bonos
  const handleBonoChange = (vehiculoId: string, name: string, mes: string, quantity: number) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            bonos: detalle.bonos.map(bono =>
              bono.name === name
                ? {
                  ...bono,
                  values: bono.values.map(val =>
                    val.mes === mes ? { ...val, quantity } : val
                  ),
                }
                : bono
            ),
          }
          : detalle
      )
    );
  };

  // Manejo de cambios en mantenimientos
  const handleMantenimientoChange = (vehiculoId: string, mes: string, quantity: number) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            mantenimientos: detalle.mantenimientos.map(mantenimiento => ({
              ...mantenimiento,
              values: mantenimiento.values.map(val =>
                val.mes === mes ? { ...val, quantity } : val
              ),
            })),
          }
          : detalle
      )
    );
  };

  const handlePernoteChange = (
    vehiculoId: string,
    index: number,
    field: string,
    value: any // Use 'any' to accept different types of values
  ) => {
    console.log(vehiculoId, index, field, value);

    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            pernotes: detalle.pernotes.map((pernote, i) =>
              i === index ? { ...pernote, [field]: value } : pernote
            ),
          }
          : detalle
      )
    );
  };

  // Manejo de cambios en recargos
  const handleRecargoChange = (vehiculoId: string, index: number, field: string, value: number | string, pag_cliente: boolean | undefined) => {
    console.log("vahiculoId", vehiculoId, "index", index, "fieldf", field, "value", value, "pagacliente:", pag_cliente)
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            recargos: detalle.recargos.map((recargo, i) =>
              i === index
                ? {
                  ...recargo,
                  [field]: value,
                  ...(pag_cliente !== undefined && { pag_cliente }),
                }
                : recargo
            ),
          }
          : detalle
      )
    );
  };

  // Añadir nuevo pernote
  const handleAddPernote = (vehiculoId: string) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            pernotes: [
              ...detalle.pernotes,
              {
                vehiculo_id: vehiculoId,  // Usar vehiculo_id en lugar de vehiculoId
                empresa_id: "",
                cantidad: 0,
                fechas: [],
                valor: Number(configuracion?.find(config => config.nombre === "Pernote")?.valor || 0),
              },
            ],
          }
          : detalle
      )
    );
  };

  // Añadir nuevo recargo
  const handleAddRecargo = (vehiculoId: string) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            recargos: [
              ...detalle.recargos,
              {
                vehiculo_id: vehiculoId,
                empresa_id: "",
                valor: 0,
                pag_cliente: false,
                mes: mesesRange[0] || ""
              },
            ],
          }
          : detalle
      )
    );
  };

  // Eliminar pernote
  const handleRemovePernote = (vehiculoId: string, index: number) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            pernotes: detalle.pernotes.filter((_, i) => i !== index),
          }
          : detalle
      )
    );
  };

  // Eliminar recargo
  const handleRemoveRecargo = (vehiculoId: string, index: number) => {
    setDetallesVehiculos(prevDetalles =>
      prevDetalles.map(detalle =>
        detalle.vehiculo.value === vehiculoId
          ? {
            ...detalle,
            recargos: detalle.recargos.filter((_, i) => i !== index),
          }
          : detalle
      )
    );
  };

  // Cálculo de bonificación Villanueva
  const bonificacionVillanueva = React.useMemo(() => {
    if (!isCheckedAjuste || !conductorSelected) return 0;

    const conductor = conductores?.find(c => c.id === conductorSelected.value);
    if (!conductor) return 0;

    const ajusteVillanueva = Number(configuracion?.find(config => config.nombre === "Salario villanueva")?.valor || 0);

    const ajusteCalculado = (ajusteVillanueva - conductor.salario_base) / 30;
    console.log(ajusteCalculado)

    if (diasLaboradosVillanueva >= 17) {
      return ajusteVillanueva - conductor.salario_base;
    } else {
      const ajustePorDiaCalculado = Number(ajusteCalculado.toFixed());
      setAjustePorDia(ajustePorDiaCalculado);
      return ajustePorDiaCalculado * diasLaboradosVillanueva;
    }
  }, [isCheckedAjuste, conductorSelected, diasLaboradosVillanueva, conductores, configuracion]);

  // Cálculos de totales financieros
  const totales = React.useMemo(() => {
    // Obtener datos del conductor
    const conductor = conductores?.find(c => c.id === conductorSelected?.value);
    const salarioBase = conductor?.salario_base || 0;

    // Cálculos básicos
    const salarioDevengado = (salarioBase / 30) * diasLaborados;
    const auxilioTransporte = (Number(configuracion?.find(config => config.nombre === "Auxilio de transporte")?.valor || 0) / 30) * diasLaborados;

    // Calcular bonificaciones
    const totalBonificaciones = detallesVehiculos.reduce(
      (acc, item) => acc + item.bonos.reduce(
        (total, bono) => total + bono.values.reduce(
          (sum, val) => sum + val.quantity * Number(bono.value), 0
        ), 0
      ), 0
    );

    // Calcular pernotes
    const totalPernotes = detallesVehiculos.reduce(
      (acc, item) => acc + item.pernotes?.reduce(
        (total, pernote) => total + (Number(pernote.cantidad) * Number(pernote.valor)), 0
      ), 0
    );

    // Calcular recargos
    const totalRecargos = detallesVehiculos.reduce(
      (acc, item) => acc + item.recargos.reduce(
        (total, recargo) => total + recargo.valor, 0
      ), 0
    );

    // Calcular deducciones
    const salud = (salarioDevengado * (Number(configuracion?.find(config => config.nombre === "Salud")?.valor || 0))) / 100;
    const pension = (salarioDevengado * (Number(configuracion?.find(config => config.nombre === "Pensión")?.valor || 0))) / 100;

    // Calcular vacaciones
    let totalVacaciones = 0;
    if (isVacaciones && periodoVacaciones) {
      const diasVacaciones = obtenerDiferenciaDias(periodoVacaciones);
      totalVacaciones = (salarioBase / 30) * (typeof diasVacaciones === 'string' ? parseFloat(diasVacaciones) : diasVacaciones);
    }

    // Calcular anticipos
    const totalAnticipos = liquidacionActual?.anticipos?.reduce(
      (total, anticipo) => total + (anticipo.valor || 0), 0
    ) || 0;

    // Calcular sueldo total
    const sueldoTotal =
      salarioDevengado +
      auxilioTransporte +
      totalBonificaciones +
      totalPernotes +
      totalRecargos +
      totalVacaciones +
      bonificacionVillanueva +
      interesCesantias -
      totalAnticipos -
      salud -
      pension;

    return {
      auxilioTransporte,
      salarioDevengado,
      totalBonificaciones,
      totalPernotes,
      totalRecargos,
      totalVacaciones,
      totalAnticipos,
      salud,
      pension,
      sueldoTotal
    };
  }, [conductores, conductorSelected, diasLaborados, configuracion, detallesVehiculos, isVacaciones, periodoVacaciones, bonificacionVillanueva, liquidacionActual, interesCesantias]);

  // Preparar datos para envío
  const prepararDatosLiquidacion = () => {
    if (!conductorSelected || !dateSelected?.start || !dateSelected?.end) {
      return null;
    }

    const formatDateValue = (date: any) => {
      return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    };

    return {
      id: liquidacionActual?.id,
      conductor_id: conductorSelected.value,
      periodoStart: formatDateValue(dateSelected.start),
      periodoEnd: formatDateValue(dateSelected.end),
      periodoStartVacaciones: periodoVacaciones?.start ? formatDateValue(periodoVacaciones.start) : null,
      periodoEndVacaciones: periodoVacaciones?.end ? formatDateValue(periodoVacaciones.end) : null,
      auxilioTransporte: totales.auxilioTransporte,
      sueldoTotal: totales.sueldoTotal,
      salarioDevengado: totales.salarioDevengado,
      totalPernotes: totales.totalPernotes,
      totalBonificaciones: totales.totalBonificaciones,
      totalRecargos: totales.totalRecargos,
      totalVacaciones: totales.totalVacaciones,
      totalAnticipos: totales.totalAnticipos,
      diasLaborados,
      diasLaboradosVillanueva,
      diasLaboradosAnual,
      ajusteSalarial: bonificacionVillanueva,
      salud: totales.salud,
      pension: totales.pension,
      cesantias,
      interesCesantias,
      estado: totales.salud > 0 && totales.pension > 0 ? 'Liquidado' : 'Pendiente',

      // Arrays relacionados
      vehiculos: vehiculosSelected.map(v => v.value),
      bonificaciones: detallesVehiculos.flatMap(detalle =>
        detalle.bonos.map(bono => ({
          name: bono.name,
          values: bono.values,
          value: bono.value,
          vehiculoId: detalle.vehiculo.value
        }))
      ),
      mantenimientos: detallesVehiculos.flatMap(detalle =>
        detalle.mantenimientos.map(mantenimiento => ({
          values: mantenimiento.values,
          value: mantenimiento.value,
          vehiculoId: detalle.vehiculo.value
        }))
      ),
      pernotes: detallesVehiculos.flatMap(detalle =>
        detalle.pernotes.map(pernote => ({
          ...pernote,
          vehiculoId: detalle.vehiculo.value
        }))
      ),
      recargos: detallesVehiculos.flatMap(detalle =>
        detalle.recargos.map(recargo => ({
          ...recargo,
          vehiculoId: detalle.vehiculo.value
        }))
      )
    };
  };

  // Validar el formulario por paso
  const validarPaso = (pasoActual: number) => {
    const errores = [];

    switch (pasoActual) {
      case 1: // Validar información general
        if (!conductorSelected) {
          errores.push('Debe seleccionar un conductor');
        }
        if (!dateSelected?.start || !dateSelected?.end) {
          errores.push('Debe seleccionar un período completo');
        }
        if (vehiculosSelected.length === 0) {
          errores.push('Debe seleccionar al menos un vehículo');
        }
        break;

      case 2: // Validar días y conceptos
        if (diasLaborados < 0 || diasLaborados > 31) {
          errores.push('Los días laborados deben estar entre 0 y 31');
        }
        break;
    }

    if (errores.length > 0) {
      alert(errores.join('\n'));
      return false;
    }

    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    const liquidacionData = prepararDatosLiquidacion();

    if (!liquidacionData) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'edit' && liquidacionActual) {
        // Esta opción es menos segura, úsala solo si estás seguro de que el valor es correcto
        await editarLiquidacion(liquidacionActual.id, liquidacionData);
      } else {
        await crearLiquidacion(liquidacionData);
      }

      await obtenerLiquidaciones();
      router.push('/conductores'); // Usando router.push en lugar de window.location
    } catch (error) {
      alert('Error al guardar la liquidación. Por favor intente nuevamente.');
      console.error('Error al guardar liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navegación entre pasos
  const avanzarPaso = () => {
    if (validarPaso(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const retrocederPaso = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-md">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FilePlus size={20} className="mr-2 text-emerald-600" />
            {mode === 'create' ? 'Nueva Liquidación' : 'Editar Liquidación'}
          </h2>
        </div>

        {/* Indicador de progreso */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full 
                    ${currentStep > i ? 'bg-emerald-600' : currentStep === i + 1 ? 'bg-white border-2 border-emerald-600' : 'bg-gray-50'}
                  `}
                >
                  {currentStep > i ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-medium ${currentStep === i + 1 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-1 w-24 md:w-40 lg:w-52 mx-2 ${currentStep > i + 1 ? 'bg-emerald-600' : 'bg-gray-50'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <div className="text-xs font-medium text-gray-600">Información</div>
            <div className="text-xs font-medium text-gray-600">Conceptos</div>
            <div className="text-xs font-medium text-gray-600">Resumen</div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {/* Paso 1: Información General */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="shadow-sm border">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                    Información del Conductor
                  </h3>

                  {/* PASO 1: Información General - Continuación */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conductor <span className="text-red-500">*</span>
                    </label>
                    <SelectReact
                      options={conductoresOptions}
                      value={conductorSelected}
                      onChange={setConductorSelected}
                      placeholder="Seleccione un conductor"
                      isSearchable
                      styles={selectStyles}
                      menuPortalTarget={document.body}  // Esto renderiza el menú en el body
                      menuPosition="fixed"              // Esto ayuda con el posicionamiento
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período de Liquidación <span className="text-red-500">*</span>
                    </label>
                    <DateRangePicker
                      onChange={handleDateChange}
                      lang="es-ES"
                      value={dateSelected}
                      classNames={{
                        base: "w-full"
                      }}
                    />
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm border">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-emerald-600" />
                    Vehículos Asignados
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehículos <span className="text-red-500">*</span>
                    </label>
                    <SelectReact
                      options={vehiculosOptions}
                      value={vehiculosSelected}
                      onChange={handleVehiculoSelect}
                      placeholder="Seleccione una o más placas"
                      isMulti
                      isSearchable
                      menuPortalTarget={document.body}  // Esto renderiza el menú en el body
                      menuPosition="fixed"              // Esto ayuda con el posicionamiento
                      styles={selectStyles}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* PASO 2: Conceptos y Cálculos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(String(key))}
                classNames={{
                  tabList: "bg-white border rounded-lg p-1",
                  cursor: "bg-emerald-50",
                  tab: "py-2 px-3 text-sm",
                  tabContent: "group-data-[selected=true]:text-emerald-600 font-medium"
                }}
                aria-label="Conceptos de liquidación"
                color="success"
              >
                <Tab
                  key="datos"
                  title={
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Días Laborados</span>
                    </div>
                  }
                >
                  <Card className="mt-4 shadow-sm border">
                    <div className="p-5 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad de días laborados
                        </label>
                        <Input
                          type="number"
                          placeholder="Ingresa la cantidad de días"
                          value={diasLaborados.toString()}
                          onChange={(e) => setDiasLaborados(+e.target.value)}
                          min={0}
                          max={31}
                          size="md"
                          startContent={<Calendar className="h-4 w-4 text-gray-400" />}
                          className="max-w-xs"
                        />
                      </div>

                      <Divider />

                      <div>
                        <Checkbox
                          isSelected={isCheckedAjuste}
                          color='success'
                          onChange={(e) => setIsCheckedAjuste(e.target.checked)}
                          size="md"
                          className="mb-2"
                        >
                          <span className="text-sm font-medium">Bonificación Villanueva</span>
                        </Checkbox>

                        {isCheckedAjuste && (
                          <div className="mt-3 pl-7 space-y-3 pt-1 border-l-2 border-emerald-100">
                            <Input
                              type="number"
                              label="Días laborados en Villanueva"
                              placeholder="Ingrese los días"
                              value={diasLaboradosVillanueva.toString()}
                              onChange={(e) => setDiasLaboradosVillanueva(+e.target.value)}
                              min={0}
                              size="sm"
                              className="max-w-xs"
                            />

                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <div>
                                <span className="text-xs text-gray-600">Valor por día:</span>
                                <span className="text-sm font-medium text-gray-800 ml-1">{formatToCOP(ajustePorDia)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <div>
                                <span className="text-xs text-gray-600">Bonificación total:</span>
                                <span className="text-sm font-medium text-gray-800 ml-1">{formatToCOP(bonificacionVillanueva)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Divider />

                      <div>
                        <Checkbox
                          isSelected={isVacaciones}
                          onChange={(e) => setIsVacaciones(e.target.checked)}
                          size="md"
                          className="mb-2"
                          color="success"
                        >
                          <span className="text-sm font-medium">Vacaciones</span>
                        </Checkbox>

                        {isVacaciones && (
                          <div className="mt-3 pl-7 space-y-3 pt-1 border-l-2 border-emerald-100">
                            <DateRangePicker
                              onChange={handleDateVacacionesChange}
                              label="Período de vacaciones"
                              lang="es-ES"
                              value={convertToDateRangeValue(periodoVacaciones)}
                              classNames={{
                                base: "max-w-md"
                              }}
                            />

                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              <div>
                                <span className="text-xs text-gray-600">Días de vacaciones:</span>
                                <span className="text-sm font-medium text-gray-800 ml-1">
                                  {obtenerDiferenciaDias(periodoVacaciones) || 0} días
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Divider />

                      <div>
                        <Checkbox
                          isSelected={isCesantias}
                          onChange={(e) => setIsCesantias(e.target.checked)}
                          size="md"
                          className="mb-2"
                          color="success"
                        >
                          <span className="text-sm font-medium">Cesantías</span>
                        </Checkbox>

                        {isCesantias && (
                          <div className="mt-3 pl-7 space-y-3 pt-1 border-l-2 border-emerald-100">
                            <Input
                              type="number"
                              label="Días laborados en el año"
                              placeholder="Ingrese los días"
                              value={diasLaboradosAnual.toString()}
                              onChange={(e) => setDiasLaboradosAnual(+e.target.value)}
                              min={0}
                              size="sm"
                              className="max-w-xs"
                            />

                            <Input
                              type="text"
                              label="Valor de las cesantías"
                              placeholder="Ingrese el valor"
                              value={formatCurrency(cesantias)}
                              onChange={(e) => {
                                const inputVal = e.target.value.replace(/[^\d]/g, "");
                                setCesantias(+inputVal || 0);
                              }}
                              size="sm"
                              startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                              className="max-w-xs"
                            />

                            <Input
                              type="text"
                              label="Interés de cesantías"
                              placeholder="Ingrese el valor"
                              value={formatCurrency(interesCesantias)}
                              onChange={(e) => {
                                const inputVal = e.target.value.replace(/[^\d]/g, "");
                                setInteresCesantias(+inputVal || 0);
                              }}
                              size="sm"
                              startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                              className="max-w-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Tab>

                <Tab
                  key="bonificaciones"
                  title={
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Bonificaciones</span>
                    </div>
                  }
                >
                  <div className="mt-4 space-y-4">
                    {detallesVehiculos.map((detalleVehiculo, index) => (
                      <Card key={index} className="shadow-sm border">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">
                              Vehículo: <span className="text-emerald-600">{detalleVehiculo.vehiculo.label}</span>
                            </h4>
                            <Badge color="success" variant="flat">{detalleVehiculo.vehiculo.label}</Badge>
                          </div>

                          <Divider className="my-3" />

                          <div className="space-y-6">
                            {detalleVehiculo.bonos.map((bono) => (
                              <div key={bono.name} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between mb-3">
                                  <h5 className="font-medium text-gray-800">{bono.name}</h5>
                                  <Tooltip content={`Valor unitario: ${formatToCOP(bono.value)}`}>
                                    <Badge variant="flat" color="success">{formatToCOP(bono.value)}</Badge>
                                  </Tooltip>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {mesesRange.map((mes) => {
                                    const bonoMes = bono.values.find((val) => val.mes === mes);
                                    return (
                                      <Input
                                        key={mes}
                                        type="number"
                                        label={mes}
                                        size="sm"
                                        placeholder="0"
                                        value={bonoMes ? bonoMes.quantity.toString() : "0"}
                                        onChange={(e) =>
                                          handleBonoChange(
                                            detalleVehiculo.vehiculo.value,
                                            bono.name,
                                            mes,
                                            +e.target.value
                                          )
                                        }
                                        min={0}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                              <div className="flex justify-between mb-3">
                                <h5 className="font-medium text-gray-800">Mantenimientos</h5>
                                <Tooltip content={`Valor unitario: ${formatToCOP(detalleVehiculo.mantenimientos[0]?.value || 0)}`}>
                                  <Badge variant="flat" color="success">
                                    {formatToCOP(detalleVehiculo.mantenimientos[0]?.value || 0)}
                                  </Badge>
                                </Tooltip>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {mesesRange.map((mes) => {
                                  const mantenimientoMes = detalleVehiculo.mantenimientos[0]?.values.find(
                                    (val) => val.mes === mes
                                  );
                                  return (
                                    <Input
                                      key={mes}
                                      type="number"
                                      label={mes}
                                      size="sm"
                                      placeholder="0"
                                      value={mantenimientoMes ? mantenimientoMes.quantity.toString() : "0"}
                                      onChange={(e) =>
                                        handleMantenimientoChange(
                                          detalleVehiculo.vehiculo.value,
                                          mes,
                                          +e.target.value
                                        )
                                      }
                                      min={0}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Tab>

                <Tab
                  key="pernotes"
                  title={
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Pernotes y Recargos</span>
                    </div>
                  }
                >
                  <div className="mt-4 space-y-4">
                    {detallesVehiculos.map((detalleVehiculo, index) => (
                      <Card key={index} className="shadow-sm border">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">
                              Vehículo: <span className="text-emerald-600">{detalleVehiculo.vehiculo.label}</span>
                            </h4>
                            <Badge color="success" variant="flat">{detalleVehiculo.vehiculo.label}</Badge>
                          </div>

                          <Divider className="my-3" />

                          {/* Pernotes */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Pernotes</h5>
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<Plus size={16} />}
                                onPress={() => handleAddPernote(detalleVehiculo.vehiculo.value)}
                                className="h-8"
                              >
                                Añadir pernote
                              </Button>
                            </div>

                            {detalleVehiculo.pernotes.length === 0 ? (
                              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-gray-400 mb-2">No hay pernotes registrados</div>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  startContent={<Plus size={16} />}
                                  onPress={() => handleAddPernote(detalleVehiculo.vehiculo.value)}
                                >
                                  Añadir pernote
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {detalleVehiculo.pernotes.map((pernote, pernoteIndex) => (
                                  <div key={pernoteIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                      <div className="md:col-span-2">
                                        <SelectReact
                                          options={empresasOptions}
                                          value={
                                            empresasOptions.find(option => option.value === pernote.empresa_id) || null
                                          }
                                          onChange={(selectedOption) =>
                                            handlePernoteChange(
                                              detalleVehiculo.vehiculo.value,
                                              pernoteIndex,
                                              "empresa_id",
                                              selectedOption?.value || ""
                                            )
                                          }
                                          placeholder="Selecciona una empresa"
                                          isSearchable
                                          styles={selectStyles}
                                        />
                                      </div>
                                      <Input
                                        type="number"
                                        label="Cantidad"
                                        size="sm"
                                        placeholder="0"
                                        value={pernote.cantidad ? pernote.cantidad.toString() : '0'}
                                        onChange={(e) => {
                                          const newCantidad = +e.target.value;
                                          let newFechas = [...(pernote.fechas || [])];

                                          // Ajustar array de fechas según nueva cantidad
                                          if (newCantidad > (pernote.fechas?.length || 0)) {
                                            newFechas = [
                                              ...newFechas,
                                              ...Array(newCantidad - (pernote.fechas?.length || 0)).fill(null),
                                            ];
                                          } else if (newCantidad < (pernote.fechas?.length || 0)) {
                                            newFechas = newFechas.slice(0, newCantidad);
                                          }

                                          handlePernoteChange(
                                            detalleVehiculo.vehiculo.value,
                                            pernoteIndex,
                                            "fechas",
                                            newFechas
                                          );

                                          handlePernoteChange(
                                            detalleVehiculo.vehiculo.value,
                                            pernoteIndex,
                                            "cantidad",
                                            newCantidad
                                          );
                                        }}
                                        min={0}
                                      />

                                      {pernote.fechas?.map((fecha, dateIndex) => (
                                        <div key={`${pernoteIndex}-${dateIndex}`} className="col-span-1 md:col-span-3">
                                          <DatePicker
                                            label={`Fecha ${dateIndex + 1}`}
                                            value={
                                              fecha 
                                                ? (parseDate(fecha) as DateValue) 
                                                : null
                                            }
                                            onChange={(value: DateValue | null) => {
                                              if (value) {
                                                // Convert DateValue back to your original date format
                                                const jsDate = new Date(
                                                  value.year, 
                                                  value.month - 1, 
                                                  value.day
                                                );
                                                const newFecha = dateToDateValue(jsDate);
                                                const newFechas = [...(pernote.fechas || [])];
                                                newFechas[dateIndex] = newFecha;
                                                handlePernoteChange(
                                                  detalleVehiculo.vehiculo.value,
                                                  pernoteIndex,
                                                  "fechas",
                                                  newFechas
                                                );
                                              }
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                      <div className="text-sm">
                                        <span className="text-gray-500">Valor:</span>
                                        <span className="font-medium ml-1">
                                          {formatToCOP(pernote.cantidad * pernote.valor)}
                                        </span>
                                      </div>

                                      <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        startContent={<Trash size={14} />}
                                        onPress={() => handleRemovePernote(detalleVehiculo.vehiculo.value, pernoteIndex)}
                                      >
                                        Eliminar
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Divider className="my-6" />

                          {/* Recargos */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-800">Recargos</h5>
                              <Button
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<Plus size={16} />}
                                onPress={() => handleAddRecargo(detalleVehiculo.vehiculo.value)}
                                className="h-8"
                              >
                                Añadir recargo
                              </Button>
                            </div>

                            {detalleVehiculo.recargos.length === 0 ? (
                              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-gray-400 mb-2">No hay recargos registrados</div>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  startContent={<Plus size={16} />}
                                  onPress={() => handleAddRecargo(detalleVehiculo.vehiculo.value)}
                                >
                                  Añadir recargo
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {detalleVehiculo.recargos.map((recargo, recargoIndex) => (
                                  <div key={recargoIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <Select
                                        label="Mes"
                                        size="sm"
                                        defaultSelectedKeys={recargo.mes ? [recargo.mes] : undefined}
                                        onSelectionChange={(selected) => {
                                          const mes = Array.from(selected)[0];
                                          handleRecargoChange(
                                            detalleVehiculo.vehiculo.value,
                                            recargoIndex,
                                            "mes",
                                            mes,
                                            undefined
                                          );
                                        }}
                                      >
                                        {mesesRange.map((mes) => (
                                          <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                                        ))}
                                      </Select>

                                      <div className="md:col-span-1">
                                        <SelectReact
                                          options={empresasOptions}
                                          value={
                                            empresasOptions.find(option => option.value === recargo.empresa_id) || null
                                          }
                                          onChange={(selectedOption) =>
                                            handleRecargoChange(
                                              detalleVehiculo.vehiculo.value,
                                              recargoIndex,
                                              "empresa_id",
                                              selectedOption?.value || '',
                                              undefined,
                                            )
                                          }
                                          placeholder="Selecciona una empresa"
                                          isSearchable
                                          styles={selectStyles}
                                        />
                                      </div>

                                      <Input
                                        type="text"
                                        label="Paga propietario"
                                        size="sm"
                                        placeholder="$0"
                                        value={
                                          !recargo.pag_cliente && recargo.valor !== 0
                                            ? formatCurrency(recargo.valor)
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const inputVal = e.target.value.replace(/[^\d]/g, "");
                                          handleRecargoChange(
                                            detalleVehiculo.vehiculo.value,
                                            recargoIndex,
                                            "valor",
                                            +inputVal || 0,
                                            false
                                          );
                                        }}
                                      />

                                      <Input
                                        type="text"
                                        label="Paga cliente"
                                        size="sm"
                                        placeholder="$0"
                                        value={
                                          recargo.pag_cliente && recargo.valor !== 0
                                            ? formatCurrency(recargo.valor)
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const inputVal = e.target.value.replace(/[^\d]/g, "");
                                          handleRecargoChange(
                                            detalleVehiculo.vehiculo.value,
                                            recargoIndex,
                                            "valor",
                                            +inputVal || 0,
                                            true
                                          );
                                        }}
                                      />
                                    </div>

                                    <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                                      <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        startContent={<Trash size={14} />}
                                        onPress={() => handleRemoveRecargo(detalleVehiculo.vehiculo.value, recargoIndex)}
                                      >
                                        Eliminar
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Tab>
              </Tabs>
            </div>
          )}

          {/* PASO 3: Resumen */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="shadow-sm border">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                    Información General
                  </h3>

                  {conductorSelected && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Conductor</div>
                        <div className="text-base font-medium">
                          {conductores?.find(c => c.id === conductorSelected.value)?.nombre}{' '}
                          {conductores?.find(c => c.id === conductorSelected.value)?.apellido}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          C.C: {conductores?.find(c => c.id === conductorSelected.value)?.numero_identificacion}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">Período de liquidación</div>
                        <div className="text-base font-medium">
                          {dateSelected?.start && dateSelected?.end ?
                            `${formatDate(dateSelected.start)} - ${formatDate(dateSelected.end)}` :
                            'No seleccionado'
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Días laborados: {diasLaborados}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border">
                  <div className="p-5">
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                      <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                      Conceptos
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-700">Salario devengado</span>
                        <span className="font-medium">{formatToCOP(totales.salarioDevengado)}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-700">Auxilio de transporte</span>
                        <span className="font-medium">{formatToCOP(totales.auxilioTransporte)}</span>
                      </div>

                      {bonificacionVillanueva > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Ajuste Villanueva</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(bonificacionVillanueva)}</span>
                        </div>
                      )}

                      {totales.totalBonificaciones > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Bonificaciones</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(totales.totalBonificaciones)}</span>
                        </div>
                      )}

                      {totales.totalPernotes > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Pernotes</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(totales.totalPernotes)}</span>
                        </div>
                      )}

                      {totales.totalRecargos > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Recargos</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(totales.totalRecargos)}</span>
                        </div>
                      )}

                      {totales.totalVacaciones > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Vacaciones</span>
                          <span className="font-medium text-orange-500">{formatToCOP(totales.totalVacaciones)}</span>
                        </div>
                      )}

                      {cesantias > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Cesantías</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(cesantias)}</span>
                        </div>
                      )}

                      {interesCesantias > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Interés cesantías</span>
                          <span className="font-medium text-emerald-600">{formatToCOP(interesCesantias)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="shadow-sm border">
                  <div className="p-5">
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                      Deducciones
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-700">
                          Salud ({configuracion?.find(config => config.nombre === "Salud")?.valor || 0}%)
                        </span>
                        <span className="font-medium text-red-500">-{formatToCOP(totales.salud)}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-700">
                          Pensión ({configuracion?.find(config => config.nombre === "Pensión")?.valor || 0}%)
                        </span>
                        <span className="font-medium text-red-500">-{formatToCOP(totales.pension)}</span>
                      </div>

                      {totales.totalAnticipos > 0 && (
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="text-sm text-gray-700">Anticipos</span>
                          <span className="font-medium text-red-500">-{formatToCOP(totales.totalAnticipos)}</span>
                        </div>
                      )}

                      <div className="pt-4 mt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total a pagar</span>
                          <span className="text-lg font-semibold text-emerald-600">{formatToCOP(totales.sueldoTotal)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium">Estado</span>
                        <Badge
                          color={totales.salud > 0 && totales.pension > 0 ? "success" : "warning"}
                          variant="flat"
                          className="px-3 py-1"
                        >
                          {totales.salud > 0 && totales.pension > 0 ? 'Liquidado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Información adicional - Resumen de vehículos */}
              <Card className="shadow-sm border">
                <div className="p-5">
                  <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                    Resumen de Vehículos
                  </h3>

                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bonificaciones</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pernotes</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Recargos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {detallesVehiculos.map((detalle) => {
                          // Calcular totales por vehículo
                          const totalBonos = detalle.bonos.reduce(
                            (sum, bono) => sum + bono.values.reduce(
                              (s, val) => s + (val.quantity * bono.value), 0
                            ), 0
                          );

                          const totalPernotes = detalle.pernotes?.reduce(
                            (sum, pernote) => sum + (pernote.cantidad * pernote.valor), 0
                          );

                          const totalRecargos = detalle.recargos.reduce(
                            (sum, recargo) => sum + recargo.valor, 0
                          );

                          return (
                            <tr key={detalle.vehiculo.value}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {detalle.vehiculo.label}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                {formatToCOP(totalBonos)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                {formatToCOP(totalPernotes)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                {formatToCOP(totalRecargos)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Totales
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-emerald-600">
                            {formatToCOP(totales.totalBonificaciones)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-emerald-600">
                            {formatToCOP(totales.totalPernotes)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-emerald-600">
                            {formatToCOP(totales.totalRecargos)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <Button
                variant="flat"
                color="default"
                size="md"
                onPress={retrocederPaso}
                startContent={<ChevronLeft size={18} />}
                className="font-medium"
              >
                Anterior
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <Button
                size="md"
                onPress={avanzarPaso}
                endContent={<ChevronRight size={18} />}
                className="font-medium bg-emerald-600 text-white"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                size="md"
                onPress={handleSubmit}
                disabled={loading}
                startContent={loading ? null : <Save size={18} />}
                className="font-medium bg-emerald-600 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </div>
                ) : (
                  "Guardar Liquidación"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidacionPage