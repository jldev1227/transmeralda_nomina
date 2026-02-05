"use client";
import { useParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import {
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  DocumentCheckIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { apiClient } from "@/config/apiClient";
import { MonthAndYear } from "@/helpers/helpers";
import { Liquidacion } from "@/context/NominaContext";
import handleGeneratePDF from "@/components/pdfMaker";
import handleGeneratePrimaPDF from "@/components/pdfMakerPrima";
import handleGenerateInteresesCesantiasPDF from "@/components/pdfMakerInteresesCesantias";
import useFirmasExistentes from "@/hooks/useFirmasExistentes";
import { FirmaConUrl } from "@/types";
import SignatureImage from "@/components/ui/signatureImage";

// Constantes mejoradas para mejor responsive design
const CANVAS_CONFIG = {
  width: 600,
  height: 200,
  lineWidth: 2,
  strokeStyle: "#1f2937",
  lineCap: "round" as CanvasLineCap,
  lineJoin: "round" as CanvasLineJoin,
  backgroundColor: "#ffffff",
  minWidth: 300,
  maxWidth: 800,
};

// Hook corregido con debug completo
// Hook corregido sin referencias circulares
const useCanvasSignature = (isDisabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const mountedRef = useRef(false);
  const setupAttemptsRef = useRef(0);
  const maxAttempts = 10; // Más intentos para producción

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || isDisabled) {
      setDebugInfo(
        `❌ Setup cancelled: canvas=${!!canvas}, disabled=${isDisabled}`,
      );

      return false;
    }

    try {
      // Verificar que el canvas esté en el DOM y sea visible
      const rect = canvas.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setDebugInfo("⏳ Esperando dimensiones...");

        return false;
      }

      // Método más estable para móviles: usar el contenedor si existe, sino viewport
      let containerWidth;
      const container = canvas.parentElement;

      if (container) {
        const containerRect = container.getBoundingClientRect();

        containerWidth = containerRect.width - 32; // Padding del contenedor
      } else {
        containerWidth = Math.min(
          window.innerWidth - 64,
          CANVAS_CONFIG.maxWidth,
        );
      }

      const aspectRatio = CANVAS_CONFIG.width / CANVAS_CONFIG.height;
      let canvasWidth = Math.max(
        CANVAS_CONFIG.minWidth,
        Math.min(containerWidth, CANVAS_CONFIG.width),
      );
      let canvasHeight = canvasWidth / aspectRatio;

      // Redondear a números enteros para evitar problemas de renderizado
      canvasWidth = Math.round(canvasWidth);
      canvasHeight = Math.round(canvasHeight);

      setDebugInfo(`📏 Dims: ${canvasWidth}x${canvasHeight}`);

      // Configurar CSS inmediatamente y de forma fija
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.display = "block";
      canvas.style.maxWidth = "100%";
      canvas.style.touchAction = "none";

      // Configurar resolución interna - FIJA para evitar cambios
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("❌ Failed to get 2D context");
        setDebugInfo("❌ No 2D context");

        return false;
      }

      // Limpiar cualquier transformación previa
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Configurar contexto de forma consistente
      ctx.scale(dpr, dpr);
      ctx.lineCap = CANVAS_CONFIG.lineCap;
      ctx.lineJoin = CANVAS_CONFIG.lineJoin;
      ctx.strokeStyle = CANVAS_CONFIG.strokeStyle;
      ctx.lineWidth = CANVAS_CONFIG.lineWidth;
      ctx.imageSmoothingEnabled = true;

      // Fondo blanco - usar dimensiones lógicas
      ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Guardar las dimensiones lógicas para uso en limpieza
      canvas.dataset.logicalWidth = canvasWidth.toString();
      canvas.dataset.logicalHeight = canvasHeight.toString();
      canvas.dataset.dpr = dpr.toString();

      setDebugInfo("✅ Canvas listo");
      setCanvasReady(true);
      setupAttemptsRef.current = 0; // Reset counter on success

      return true;
    } catch (error) {
      console.error("❌ Canvas setup error:", error);
      setDebugInfo(`❌ Error: ${error}`);

      return false;
    }
  }, [isDisabled]);

  // Función de setup con reintentos automáticos SIN referencia circular
  const attemptSetup = useCallback(() => {
    if (!mountedRef.current || isDisabled) return;

    setupAttemptsRef.current += 1;

    const success = setupCanvas();

    if (success) {
      return;
    }

    if (setupAttemptsRef.current < maxAttempts) {
      // Delay incremental más largo para producción
      const delay = Math.min(setupAttemptsRef.current * 200, 2000);

      setTimeout(() => {
        if (mountedRef.current) {
          attemptSetup();
        }
      }, delay);
    } else {
      setDebugInfo(`❌ Falló después de ${maxAttempts} intentos`);
    }
  }, [setupCanvas, isDisabled, maxAttempts]);

  // Setup inicial más robusto
  useEffect(() => {
    mountedRef.current = true;
    setupAttemptsRef.current = 0;

    if (isDisabled) {
      return;
    }

    setCanvasReady(false);
    setDebugInfo("🔄 Iniciando...");

    // Delay inicial más largo para producción
    const initialDelay = process.env.NODE_ENV === "production" ? 100 : 10;

    setTimeout(() => {
      if (mountedRef.current) {
        attemptSetup();
      }
    }, initialDelay);

    return () => {
      mountedRef.current = false;
    };
  }, [attemptSetup, isDisabled]);

  // Resize handler simplificado
  useEffect(() => {
    if (isDisabled || !canvasReady) return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          setCanvasReady(false);
          setupAttemptsRef.current = 0;
          attemptSetup();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [attemptSetup, isDisabled, canvasReady]);

  const getCoordinates = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      const canvas = canvasRef.current;

      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      if (isDisabled || !canvasReady) return;

      e.preventDefault();
      e.stopPropagation();

      const coords = getCoordinates(e);

      setIsDrawing(true);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    },
    [getCoordinates, isDisabled, canvasReady],
  );

  const draw = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      if (!isDrawing || isDisabled || !canvasReady) return;

      e.preventDefault();
      e.stopPropagation();

      const coords = getCoordinates(e);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    },
    [isDrawing, getCoordinates, isDisabled, canvasReady],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing || isDisabled) return;
    setIsDrawing(false);
    setHasSigned(true);
  }, [isDrawing, isDisabled]);

  const clearSignature = useCallback(() => {
    if (isDisabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx && canvas) {
      const logicalWidth = parseFloat(canvas.dataset.logicalWidth || "0");
      const logicalHeight = parseFloat(canvas.dataset.logicalHeight || "0");

      if (logicalWidth && logicalHeight) {
        ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const rect = canvas.getBoundingClientRect();

        ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }

    setHasSigned(false);
  }, [isDisabled]);

  const clearSignatureRobust = useCallback(() => {
    if (isDisabled) return;

    setCanvasReady(false);
    setHasSigned(false);
    setupAttemptsRef.current = 0;

    setTimeout(() => {
      if (mountedRef.current) {
        attemptSetup();
      }
    }, 50);
  }, [isDisabled, attemptSetup]);

  const getSignatureDataURL = useCallback((): string => {
    const canvas = canvasRef.current;

    return canvas ? canvas.toDataURL("image/png", 0.8) : "";
  }, []);

  // Función de setup manual (sin usar attemptSetup para evitar circular)
  const forceSetup = useCallback(() => {
    setCanvasReady(false);
    setDebugInfo("🔧 Forzando setup...");
    setupAttemptsRef.current = 0;

    setTimeout(() => {
      if (mountedRef.current) {
        const success = setupCanvas();

        if (!success) {
          setDebugInfo("❌ Setup manual falló");
        }
      }
    }, 50);
  }, [setupCanvas]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDisabled && canvasReady) {
        document.body.style.overflow = "hidden";
      }
      startDrawing(e);
    },
    [startDrawing, isDisabled, canvasReady],
  );

  const handleTouchEnd = useCallback(() => {
    document.body.style.overflow = "";
    stopDrawing();
  }, [stopDrawing]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      draw(e);
    },
    [draw],
  );

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return {
    canvasRef,
    hasSigned,
    canvasReady,
    debugInfo,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    clearSignatureRobust,
    getSignatureDataURL,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    forceSetup,
  };
};

// Componente principal
export default function Page() {
  const params = useParams();
  const liquidacionId = params.id as string;

  // Estados principales
  const [liquidacionData, setLiquidacionData] = useState<Liquidacion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentoFirmado, setDocumentoFirmado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks personalizados
  const {
    firmas,
    loading: firmasLoading,
    cargarFirmas,
  } = useFirmasExistentes();
  const canvasSignature = useCanvasSignature(documentoFirmado);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Memoización de datos formateados
  const conductorInfo = useMemo(() => {
    if (!liquidacionData) return null;

    return {
      nombreCompleto: `${liquidacionData.conductor.nombre} ${liquidacionData.conductor.apellido}`,
      nomina: `${MonthAndYear(liquidacionData.periodo_end)}`,
      numero_identificacion: liquidacionData.conductor.numero_identificacion,
    };
  }, [liquidacionData]);

  // Funciones principales
  const fetchLiquidacion = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apiClient.get(`/api/nomina/conductores/${id}`);

      if (data?.data) {
        setLiquidacionData(data.data);
      } else {
        throw new Error("No se encontraron datos de liquidación");
      }
    } catch (error) {
      console.error(`Error fetching liquidacion with ID ${id}:`, error);
      setError("Error al cargar los datos de liquidación");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitSignature = useCallback(async () => {
    if (!canvasSignature.hasSigned || !liquidacionData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const signatureData = canvasSignature.getSignatureDataURL();

      await apiClient.post(`/api/firmas_desprendible`, {
        signatureData,
        conductorId: liquidacionData.conductor.id,
        liquidacionId: liquidacionData.id,
      });

      setDocumentoFirmado(true);
      onOpen();
      await cargarFirmas(liquidacionId);
    } catch (error) {
      console.error("Error al enviar la firma:", error);
      setError("Error al procesar la firma. Por favor, inténtelo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canvasSignature, liquidacionData, onOpen, cargarFirmas, liquidacionId]);

  const viewDocument = useCallback(() => {
    if (liquidacionData) {
      handleGeneratePDF(liquidacionData, [], false);
    }
  }, [liquidacionData]);

  const viewPrimaDocument = useCallback(() => {
    if (liquidacionData) {
      handleGeneratePrimaPDF(liquidacionData, []);
    }
  }, [liquidacionData]);

  const viewInteresesDocument = useCallback(() => {
    if (liquidacionData) {
      handleGenerateInteresesCesantiasPDF(liquidacionData, []);
    }
  }, [liquidacionData]);

  // Verificar si tiene prima o intereses
  const tienePrima = useMemo(() => {
    if (!liquidacionData) return false;
    const primaValue =
      typeof liquidacionData.prima === "number"
        ? liquidacionData.prima
        : parseFloat(liquidacionData.prima || "0");
    const primaPendienteValue =
      typeof liquidacionData.prima_pendiente === "number"
        ? liquidacionData.prima_pendiente
        : parseFloat(liquidacionData.prima_pendiente || "0");

    return primaValue > 0 || primaPendienteValue > 0;
  }, [liquidacionData]);

  const tieneIntereses = useMemo(() => {
    if (!liquidacionData) return false;
    const interesesValue =
      typeof liquidacionData.interes_cesantias === "number"
        ? liquidacionData.interes_cesantias
        : parseFloat(liquidacionData.interes_cesantias || "0");

    return interesesValue > 0;
  }, [liquidacionData]);

  // Efectos
  useEffect(() => {
    if (!liquidacionId) return;

    const loadData = async () => {
      await fetchLiquidacion(liquidacionId);
      const tieneFirmas = await cargarFirmas(liquidacionId);

      setDocumentoFirmado(tieneFirmas);
    };

    loadData();
  }, [liquidacionId, fetchLiquidacion, cargarFirmas]);

  // Renderizado condicional para loading
  if (isLoading || firmasLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !liquidacionData) {
    return (
      <ErrorState
        error={error}
        onRetry={() => fetchLiquidacion(liquidacionId)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <PageHeader documentoFirmado={documentoFirmado} />

        <Card className="w-full">
          <CardHeader className="pb-3">
            <DocumentStatus documentoFirmado={documentoFirmado} />
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {conductorInfo && (
              <ConductorInfo
                documentoFirmado={documentoFirmado}
                info={conductorInfo}
              />
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {documentoFirmado ? (
              <SignedDocumentView
                firmas={firmas}
                onViewDocument={viewDocument}
                onViewPrima={viewPrimaDocument}
                onViewIntereses={viewInteresesDocument}
                tienePrima={tienePrima}
                tieneIntereses={tieneIntereses}
              />
            ) : (
              <SignatureProcess
                canvasSignature={canvasSignature}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitSignature}
              />
            )}
          </CardBody>
        </Card>

        <SuccessModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onViewDocument={viewDocument}
        />
      </div>
    </div>
  );
}

// Componentes auxiliares
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-2xl">
      <CardBody className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardBody>
    </Card>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-2xl">
      <CardBody className="text-center space-y-4">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Error</h2>
        <p className="text-gray-600">{error}</p>
        <Button color="primary" onPress={onRetry}>
          Reintentar
        </Button>
      </CardBody>
    </Card>
  </div>
);

const PageHeader = ({ documentoFirmado }: { documentoFirmado: boolean }) => (
  <div className="mb-6 text-center">
    <h1 className="text-3xl font-bold text-emerald-600 mb-2">
      {!documentoFirmado && "Firma de Desprendible de Nómina"}
    </h1>
    <p className="text-gray-600">
      {!documentoFirmado &&
        "Complete el proceso de firma para acceder a su desprendible de pago"}
    </p>
  </div>
);

const DocumentStatus = ({
  documentoFirmado,
}: {
  documentoFirmado: boolean;
}) => (
  <div className="flex items-center gap-2 w-full justify-center">
    {documentoFirmado ? (
      <>
        <DocumentCheckIcon className="h-5 w-5 text-green-600" />
        <h2 className="text-xl font-semibold text-green-600">
          Documento Firmado
        </h2>
      </>
    ) : (
      <>
        <PencilIcon className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-semibold text-emerald-600">
          Tablero de Firma Digital
        </h2>
      </>
    )}
  </div>
);

const ConductorInfo = ({
  info,
  documentoFirmado,
}: {
  info: {
    nombreCompleto: string;
    nomina: string;
    numero_identificacion: string;
  };
  documentoFirmado: boolean;
}) => (
  <div
    className={`p-4 rounded-lg ${documentoFirmado ? "bg-green-50" : "bg-emerald-50"}`}
  >
    <h3
      className={`font-medium mb-2 ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
    >
      Información del Conductor
    </h3>
    <div className="space-y-1">
      <InfoItem
        documentoFirmado={documentoFirmado}
        label="Nombre"
        value={info.nombreCompleto}
      />
      <InfoItem
        documentoFirmado={documentoFirmado}
        label="CC"
        value={info.numero_identificacion}
      />
      <InfoItem
        documentoFirmado={documentoFirmado}
        label="Nomina"
        value={info.nomina}
      />
    </div>
  </div>
);

const InfoItem = ({
  label,
  value,
  documentoFirmado,
}: {
  label: string;
  value: string;
  documentoFirmado: boolean;
}) => (
  <p>
    <span
      className={`font-medium ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
    >
      {label}:
    </span>{" "}
    {value}
  </p>
);

const SignedDocumentView = ({
  firmas,
  onViewDocument,
  onViewPrima,
  onViewIntereses,
  tienePrima,
  tieneIntereses,
}: {
  firmas: FirmaConUrl[];
  onViewDocument: () => void;
  onViewPrima: () => void;
  onViewIntereses: () => void;
  tienePrima: boolean;
  tieneIntereses: boolean;
}) => (
  <div className="space-y-4">
    <div className="bg-green-50 border-l-4 border-green-400 p-4">
      <div className="flex items-start">
        <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Documento Firmado Exitosamente
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Los desprendibles han sido firmados digitalmente. Puede proceder a
            visualizar o descargar los documentos disponibles.
          </p>
        </div>
      </div>
    </div>

    <FirmasExistentes firmas={firmas} />

    {/* Botones de visualización */}
    <div className="space-y-3">
      <Button
        className="w-full"
        color="primary"
        startContent={<EyeIcon className="h-4 w-4" />}
        onPress={onViewDocument}
      >
        Ver Desprendible de Nómina
      </Button>

      {tienePrima && (
        <Button
          className="w-full"
          color="secondary"
          startContent={<EyeIcon className="h-4 w-4" />}
          variant="flat"
          onPress={onViewPrima}
        >
          Ver Desprendible de Prima
        </Button>
      )}

      {tieneIntereses && (
        <Button
          className="w-full"
          color="success"
          startContent={<EyeIcon className="h-4 w-4" />}
          variant="flat"
          onPress={onViewIntereses}
        >
          Ver Desprendible de Intereses de Cesantías
        </Button>
      )}
    </div>
  </div>
);

const SignatureProcess = ({
  canvasSignature,
  isSubmitting,
  onSubmit,
}: {
  canvasSignature: ReturnType<typeof useCanvasSignature>;
  isSubmitting: boolean;
  onSubmit: () => void;
}) => (
  <>
    <ImportantNotice />
    <SignatureCanvas canvasSignature={canvasSignature} />
    <SignatureActions
      canvasSignature={canvasSignature}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  </>
);

const ImportantNotice = () => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <div className="flex items-start">
      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Para poder visualizar o descargar su desprendible de nómina, debe
          firmar digitalmente confirmando que ha recibido el documento.
        </p>
      </div>
    </div>
  </div>
);

const SignatureCanvas = ({
  canvasSignature,
}: {
  canvasSignature: ReturnType<typeof useCanvasSignature>;
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700" htmlFor="signature">
        Firme en el recuadro de abajo:
      </label>

      <div className="relative border-2 border-gray-300 rounded-lg bg-white p-2 mx-auto max-w-full overflow-hidden">
        {/* Indicador de carga con debug info */}
        {!canvasSignature.canvasReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 rounded z-10">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
              <span className="text-sm font-medium">Preparando canvas...</span>
            </div>

            {/* Debug info */}
            <div className="text-xs text-gray-500 text-center mb-3">
              {canvasSignature.debugInfo}
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasSignature.canvasRef}
          className={`
            border border-gray-200 rounded block mx-auto
            ${canvasSignature.canvasReady ? "cursor-crosshair" : "cursor-wait"}
            ${!canvasSignature.canvasReady ? "opacity-50" : "opacity-100"}
            transition-opacity duration-200
          `}
          id="signature"
          style={{
            touchAction: "none",
            backgroundColor: CANVAS_CONFIG.backgroundColor,
            maxWidth: "100%",
            height: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            minHeight: "120px",
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={canvasSignature.startDrawing}
          onMouseLeave={canvasSignature.stopDrawing}
          onMouseMove={canvasSignature.draw}
          onMouseUp={canvasSignature.stopDrawing}
          onTouchCancel={canvasSignature.handleTouchEnd}
          onTouchEnd={canvasSignature.handleTouchEnd}
          onTouchMove={canvasSignature.handleTouchMove}
          onTouchStart={canvasSignature.handleTouchStart}
        />
      </div>

      {/* Texto de ayuda con estado */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        {canvasSignature.canvasReady && (
          <p>Firme con el mouse o dedo en dispositivos táctiles</p>
        )}
      </div>
    </div>
  );
};

const SignatureActions = ({
  canvasSignature,
  isSubmitting,
  onSubmit,
}: {
  canvasSignature: ReturnType<typeof useCanvasSignature>;
  isSubmitting: boolean;
  onSubmit: () => void;
}) => (
  <div className="space-y-3">
    {/* Botones de limpieza */}
    <div className="flex gap-2">
      <Button
        className="flex-1"
        color="danger"
        isDisabled={!canvasSignature.hasSigned || !canvasSignature.canvasReady}
        size="sm"
        startContent={<TrashIcon className="h-3 w-3" />}
        variant="flat"
        onPress={canvasSignature.clearSignature}
      >
        Limpiar
      </Button>
    </div>

    {/* Botón principal */}
    <Button
      className="w-full"
      color="primary"
      isDisabled={!canvasSignature.hasSigned || !canvasSignature.canvasReady}
      isLoading={isSubmitting}
      startContent={!isSubmitting && <CheckCircleIcon className="h-4 w-4" />}
      onPress={onSubmit}
    >
      {isSubmitting ? "Procesando..." : "Confirmar Firma"}
    </Button>
  </div>
);

const FirmasExistentes = ({ firmas }: { firmas: FirmaConUrl[] }) => {
  const formatFechaFirma = useCallback((fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  if (firmas.length === 0) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">Detalles de la Firma</h4>
      {firmas.map((firma) => (
        <FirmaItem
          key={firma.id}
          firma={firma}
          formatFecha={formatFechaFirma}
        />
      ))}
    </div>
  );
};

const FirmaItem = ({
  firma,
  formatFecha,
}: {
  firma: FirmaConUrl;
  formatFecha: (fecha: string) => string;
}) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <ClockIcon className="h-4 w-4 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {firma.conductor.nombre} {firma.conductor.apellido}
          </p>
          <p className="text-xs text-gray-500">
            Firmado el {formatFecha(firma.fecha_firma)}
          </p>
        </div>
      </div>
      <Chip
        color="success"
        size="sm"
        startContent={<CheckCircleIcon className="h-3 w-3" />}
        variant="flat"
      >
        {firma.estado}
      </Chip>
    </div>
    <SignatureImage firma={firma} />
  </div>
);

const SuccessModal = ({
  isOpen,
  onOpenChange,
  onViewDocument,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDocument: () => void;
}) => (
  <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span>Firma Registrada Exitosamente</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="mb-4">
              Su firma ha sido registrada y guardada de forma segura. El
              documento ya está disponible para su consulta.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-1 text-sm text-green-800">
                <p>✓ Firma digital registrada</p>
                <p>✓ Documento disponible para visualización</p>
                <p>✓ Descarga habilitada</p>
                <p>✓ Registro de auditoría creado</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cerrar
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onClose();
                onViewDocument();
              }}
            >
              Ver Documento
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);
