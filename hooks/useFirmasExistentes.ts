import { useCallback, useState } from "react";

import { apiClient } from "@/config/apiClient";
import { Conductor } from "@/context/NominaContext";

interface Firma {
  id: string;
  fecha_firma: string;
  estado: "Activa" | "Inactiva";
  conductor: Conductor;
  firma_s3_key: string;
}

interface FirmaConUrl extends Firma {
  presignedUrl?: string;
  urlLoading?: boolean;
  urlError?: boolean;
}

// Hook para manejo de firmas existentes
const useFirmasExistentes = () => {
  const [firmas, setFirmas] = useState<FirmaConUrl[]>([]);
  const [loading, setLoading] = useState(false);

  const getPresignedUrl = useCallback(
    async (s3Key: string): Promise<string | null> => {
      try {
        const response = await apiClient.get(`/api/documentos/url-firma`, {
          params: { key: s3Key },
        });

        return response.data.url;
      } catch (error) {
        console.error("Error al obtener URL firmada:", error);

        return null;
      }
    },
    [],
  );

  const cargarFirmas = useCallback(
    async (liquidacionId: string) => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(
          `/api/firmas_desprendible/liquidacion/${liquidacionId}`,
        );

        if (data?.success && data?.data) {
          const firmasActivas = data.data.filter(
            (firma: Firma) => firma.estado === "Activa",
          );

          // Inicializar con loading state
          const firmasInicial: FirmaConUrl[] = firmasActivas.map(
            (firma: Firma) => ({
              ...firma,
              urlLoading: true,
              urlError: false,
            }),
          );

          setFirmas(firmasInicial);

          // Cargar URLs de forma paralela
          const promesasUrls = firmasActivas.map(
            async (firma: Firma, index: number) => {
              try {
                const url = await getPresignedUrl(firma.firma_s3_key);

                return { index, url, error: !url };
              } catch {
                return { index, url: null, error: true };
              }
            },
          );

          const resultados = await Promise.allSettled(promesasUrls);

          setFirmas((prev) => {
            const nuevasFirmas = [...prev];

            resultados.forEach((resultado, i) => {
              if (resultado.status === "fulfilled") {
                const { index, url, error } = resultado.value;

                nuevasFirmas[index] = {
                  ...nuevasFirmas[index],
                  presignedUrl: url || undefined,
                  urlLoading: false,
                  urlError: error,
                };
              } else {
                nuevasFirmas[i] = {
                  ...nuevasFirmas[i],
                  urlLoading: false,
                  urlError: true,
                };
              }
            });

            return nuevasFirmas;
          });

          return firmasActivas.length > 0;
        }

        return false;
      } catch (error) {
        console.error("Error verificando firmas existentes:", error);
        setFirmas([]);

        return false;
      } finally {
        setLoading(false);
      }
    },
    [getPresignedUrl],
  );

  return { firmas, loading, cargarFirmas };
};

export default useFirmasExistentes;
