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
