import { DateValue } from '@nextui-org/react';
import { AnyCalendarDate } from '@internationalized/date';

/**
 * Formatea un valor numérico a formato de moneda COP
 * @param value - Valor a formatear
 * @returns String con formato de moneda COP
 */
export const formatToCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea un valor numérico a formato de moneda genérico
 * @param value - Valor a formatear
 * @returns String con formato de moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea una fecha al formato DD/MM/YYYY
 * @param date - Objeto de fecha (DateValue o Date)
 * @returns String con la fecha formateada
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    throw new Error('La fecha debe ser una cadena válida.');
  }

  // Crear un objeto Date a partir de la cadena en formato 'YYYY-MM-DD'
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha no válida.');
  }

  // Establecer la hora a medianoche para evitar problemas de zona horaria
  date.setHours(0, 0, 0, 0);

  // Sumar 1 al día
  date.setDate(date.getDate() + 1);

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString('es-ES', options);
}
/**
 * Formatea un DateValue a formato YYYY-MM-DD
 * @param date - Objeto DateValue
 * @returns String con la fecha en formato YYYY-MM-DD
 */
export const formatDateValue = (date: DateValue): string => {
  return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
};

/**
 * Convierte un objeto Date a un string en formato YYYY-MM-DD
 * @param date - Objeto Date
 * @returns String con la fecha en formato YYYY-MM-DD
 */
export const dateToDateValue = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * Obtiene un array de meses entre dos fechas (formato: "YYYY-MM-DD")
 * @param startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns Array con los meses en formato "MMM YYYY" (por ejemplo, "Ene 2023")
 */
export const obtenerMesesEntreFechas = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const meses = [];

  // Crear un objeto para formatear los nombres de meses
  const formatoMes = new Intl.DateTimeFormat('es', { month: 'long' });

  // Crear una copia de la fecha de inicio
  const currentDate = new Date(start);

  // Establecer el día 1 para cada mes
  currentDate.setDate(1);

  // Iterar entre meses
  while (currentDate <= end) {
    const mes = formatoMes.format(currentDate).charAt(0).toUpperCase() + formatoMes.format(currentDate).slice(1);
    const año = currentDate.getFullYear();
    meses.push(`${mes}`);

    // Avanzar al siguiente mes
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return meses;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param dateRange - Objeto con fechas de inicio y fin
 * @returns Número de días de diferencia o mensaje si no hay fechas válidas
 */
export const obtenerDiferenciaDias = (dateRange: any): number | string => {
  if (!dateRange || !dateRange.start || !dateRange.end) {
    return 'Sin fechas seleccionadas';
  }

  const start = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day);
  const end = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day);

  // Calcular la diferencia en días
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día final

  return diffDays;
};

export function MesyAño(dateString: string | undefined): string {

  if (!dateString) {
    throw new Error('La fecha debe ser una cadena válida.');
  }

  // Crear un objeto Date a partir de la cadena en formato 'YYYY-MM-DD'
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha no válida.');
  }

  // Establecer la hora a medianoche para evitar problemas de zona horaria
  date.setHours(0, 0, 0, 0);

  // Sumar 1 al día
  date.setDate(date.getDate() + 1);

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString('es-ES', options).toUpperCase();
}

export const agruparFechasConsecutivas = (fechas: string[]) => {
  if (!fechas || fechas.length === 0) return [];

  // Convertir strings a objetos Date y ordenar
  const fechasOrdenadas = fechas
    .filter((f) => f)
    .map((f) => new Date(f))
    .sort((a, b) => a - b);

  const rangos = [];
  let rangoActual = {
    inicio: fechasOrdenadas[0],
    fin: fechasOrdenadas[0],
  };

  for (let i = 1; i < fechasOrdenadas.length; i++) {
    const fechaActual = fechasOrdenadas[i];
    const fechaAnterior = fechasOrdenadas[i - 1];

    // Verificar si son consecutivas (diferencia de 1 día)
    const diffTime = Math.abs(fechaActual - fechaAnterior);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Son consecutivas, extender el rango actual
      rangoActual.fin = fechaActual;
    } else {
      // No son consecutivas, guardar el rango actual y empezar uno nuevo
      rangos.push(rangoActual);
      rangoActual = { inicio: fechaActual, fin: fechaActual };
    }
  }

  // Añadir el último rango
  rangos.push(rangoActual);

  // Formatear rangos
  return rangos.map((rango) => {
    const inicioStr = formatDateShort(rango.inicio);
    const finStr = formatDateShort(rango.fin);

    return inicioStr === finStr
      ? inicioStr // Fecha individual
      : `${inicioStr}~${finStr}`; // Rango
  });
};

export function formatDateShort(dateStr : Date | undefined) : string {
  if (!dateStr) return "";

  try {
    const date = new Date(dateStr);

    // Obtener el día con dos dígitos
    const day = date.getDate().toString().padStart(2, "0");

    // Obtener el mes abreviado en minúsculas
    const month = date
      .toLocaleString("es", { month: "short" })
      .toLowerCase();

    // Devolver formato "DD-MMM"
    return `${day}-${month}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}