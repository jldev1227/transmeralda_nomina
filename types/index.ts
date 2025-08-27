import { SVGProps } from "react";

import { Conductor } from "@/context/NominaContext";

// Definición de tipos para SVG
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Firma {
  id: string;
  fecha_firma: string;
  estado: "Activa" | "Inactiva";
  conductor: Conductor;
  firma_s3_key: string;
}

export interface FirmaConUrl extends Firma {
  presignedUrl?: string;
  urlLoading?: boolean;
  urlError?: boolean;
}

export interface DiaLaboral {
  id: string;
  dia: number;
  hora_inicio: string;
  hora_fin: string;
  total_horas: number;
  es_especial: boolean;
  es_domingo: boolean;
  es_festivo: boolean;
  hed: number;
  hen: number;
  hefd: number;
  hefn: number;
  rn: number;
  rd: number;
  tipos_recargos: TipoRecargo[];
}

export interface TipoRecargo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  subcategoria: string;
  porcentaje: number; // Viene como string del backend
  adicional: boolean;
  es_valor_fijo: boolean;
  valor_fijo: string | null;
  aplica_festivos: boolean | null;
  aplica_domingos: boolean | null;
  aplica_nocturno: boolean | null;
  aplica_diurno: boolean | null;
  orden_calculo: number;
  es_hora_extra: boolean;
  requiere_horas_extras: boolean;
  limite_horas_diarias: number | null;
  activo: boolean;
  vigencia_desde: string;
  vigencia_hasta: string | null;
  createdAt: string;
  updatedAt: string;
  horas: number;
  valor_hora_base: number;
  valor_hora_con_recargo: number;
  valor_calculado: number;
}
