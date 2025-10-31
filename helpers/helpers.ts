import { DateValue } from "@heroui/system/dist/types";

/**
 * Formatea un valor numérico a formato de moneda COP
 * @param value - Valor a formatear
 * @returns String con formato de moneda COP
 */
export const formatToCOP = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea un valor numérico a formato de moneda genérico
 * @param value - Valor a formatear
 * @returns String con formato de moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Función para formatear porcentajes
 * @param value - Valor a formatear
 * @returns String con formato de moneda
 */
export const formatPercentage = (value: number): string => {
  if (!value || value === 0) return "";

  return `${value}%`;
};

/**
 * Función para formatear números con separadores de mileso
 * @param value - Valor a formatear
 * @returns String con formato de moneda
 */
export const formatNumber = (value: number): string => {
  if (!value || value === 0) return "";

  return new Intl.NumberFormat("es-CO").format(value);
};

/**
 * Formatea una fecha al formato DD/MM/YYYY
 * @param date - Objeto de fecha (DateValue o Date)
 * @returns String con la fecha formateada
 */
export function formatDate(date: string | DateValue | undefined): string {
  if (!date) {
    return "Fecha no especificada";
  }

  let dateObj: Date;

  if (typeof date === "string") {
    // Si es string, convertir a Date
    dateObj = new Date(`${date}T00:00:00`);
  } else {
    // Si es DateValue/CalendarDate, extraer los componentes
    if ("year" in date && "month" in date && "day" in date) {
      // Es un CalendarDate
      dateObj = new Date(date.year, date.month - 1, date.day);
    } else {
      // Si no se puede procesar, devolver mensaje de error
      return "Formato de fecha no válido";
    }
  }

  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return "Fecha no válida";
  }

  // Definir opciones para el formato de fecha
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  // Formatear y devolver la fecha
  return dateObj.toLocaleDateString("es-ES", options);
}
/**
 * Formatea un DateValue a formato YYYY-MM-DD
 * @param date - Objeto DateValue
 * @returns String con la fecha en formato YYYY-MM-DD
 */
export const formatDateValue = (date: DateValue): string => {
  return `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
};

/**
 * Convierte un objeto Date a un string en formato YYYY-MM-DD
 * @param date - Objeto Date
 * @returns String con la fecha en formato YYYY-MM-DD
 */
export const dateToDateValue = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

/**
 * Obtiene un array de meses entre dos fechas (formato: "YYYY-MM-DD")
 * @param startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns Array con los meses en formato "MMM YYYY" (por ejemplo, "Ene 2023")
 */
export const obtenerMesesEntreFechas = (
  startDate: string,
  endDate: string,
): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const meses = [];

  // Crear un objeto para formatear los nombres de meses
  const formatoMes = new Intl.DateTimeFormat("es", { month: "long" });

  // Crear una copia de la fecha de inicio
  const currentDate = new Date(start);

  // Establecer el día 1 para cada mes
  currentDate.setDate(1);

  // Iterar entre meses
  while (currentDate <= end) {
    const mes =
      formatoMes.format(currentDate).charAt(0).toUpperCase() +
      formatoMes.format(currentDate).slice(1);

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
    return "Sin fechas seleccionadas";
  }

  const start = new Date(
    dateRange.start.year,
    dateRange.start.month - 1,
    dateRange.start.day,
  );
  const end = new Date(
    dateRange.end.year,
    dateRange.end.month - 1,
    dateRange.end.day,
  );

  // Calcular la diferencia en días
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día final

  return diffDays;
};

export function MonthAndYear(dateString: string | undefined): string {
  if (!dateString) {
    throw new Error("La fecha debe ser una cadena válida.");
  }

  // Crear un objeto Date a partir de la cadena en formato 'YYYY-MM-DD'
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error("Fecha no válida.");
  }

  // Establecer la hora a medianoche para evitar problemas de zona horaria
  date.setHours(0, 0, 0, 0);

  // Sumar 1 al día
  date.setDate(date.getDate() + 1);

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString("es-ES", options).toUpperCase();
}

export function formatDateShort(date: Date | string): string {
  if (!date) return "";

  let dateObj: Date;

  if (typeof date === "string") {
    // Si es string, separar la fecha en componentes
    const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));

    // Crear la fecha usando componentes (año, mes [0-11], día)
    dateObj = new Date(year, month - 1, day);
  } else {
    // Si ya es un objeto Date, usar directamente
    dateObj = date;
  }

  const formattedDay = dateObj.getDate().toString().padStart(2, "0");

  // Crear un array con los nombres cortos de los meses en español
  const shortMonths = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const formattedMonth = shortMonths[dateObj.getMonth()];

  return `${formattedDay}-${formattedMonth}`;
}

export const agruparFechasConsecutivas = (fechas: string[]) => {
  if (!fechas || fechas.length === 0) return [];

  // Convertir strings a objetos Date usando la lógica corregida
  const fechasOrdenadas = fechas
    .filter((f) => f)
    .map((f) => {
      const [year, month, day] = f.split("-").map((num) => parseInt(num, 10));

      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  const rangos = [];
  let rangoActual = {
    inicio: fechasOrdenadas[0],
    fin: fechasOrdenadas[0],
  };

  for (let i = 1; i < fechasOrdenadas.length; i++) {
    const fechaActual = fechasOrdenadas[i];
    const fechaAnterior = fechasOrdenadas[i - 1];

    // Convertir a números (timestamps) antes de la operación aritmética
    const diffTime = Math.abs(fechaActual.getTime() - fechaAnterior.getTime());
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

export const formatearHora = (hora: string) => {
  if (!hora) return "-";

  // Normalizar separadores: reemplaza puntos por dos puntos
  const normalizada = hora.replace(/\./g, ":");

  // Separar horas y minutos
  const [hStr, mStr] = normalizada.split(":");
  let horas = parseInt(hStr, 10);
  let minutos = parseInt(mStr || "0", 10);

  // 🔒 Asegurar dos dígitos en ambos valores
  const hh = horas.toString().padStart(2, "0");
  const mm = minutos.toString().padStart(2, "0");

  return `${hh}:${mm}`;
};

export function toDateValue(date: any): DateValue {
  // Aquí puedes agregar lógica específica para la conversión si es necesario
  return date as DateValue;
}
