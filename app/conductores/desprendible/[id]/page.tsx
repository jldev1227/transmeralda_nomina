"use client";
import { useParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import {
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  DocumentCheckIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import { apiClient } from "@/config/apiClient";
import { formatDate, MonthAndYear } from "@/helpers/helpers";
import { Liquidacion } from "@/context/NominaContext";
import handleGeneratePDF from "@/components/pdfMaker";

// Tipos mejorados y organizados
interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  numero_identificacion: string;
}

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

// Constantes
const CANVAS_CONFIG = {
  width: 600,
  height: 256,
  lineWidth: 2,
  strokeStyle: "#000000",
  lineCap: "round" as CanvasLineCap,
  lineJoin: "round" as CanvasLineJoin,
  backgroundColor: "#ffffff",
};

// Hook personalizado para manejo del canvas
const useCanvasSignature = (isDisabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || isDisabled) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = CANVAS_CONFIG.lineCap;
    ctx.lineJoin = CANVAS_CONFIG.lineJoin;
    ctx.strokeStyle = CANVAS_CONFIG.strokeStyle;
    ctx.lineWidth = CANVAS_CONFIG.lineWidth;
    ctx.imageSmoothingEnabled = true;

    ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [isDisabled]);

  useEffect(() => {
    if (isDisabled) return;

    setupCanvas();
    const timer = setTimeout(setupCanvas, 100);

    window.addEventListener("resize", setupCanvas);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [setupCanvas, isDisabled]);

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
      if (isDisabled) return;
      e.preventDefault();

      const coords = getCoordinates(e);

      setIsDrawing(true);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    },
    [getCoordinates, isDisabled],
  );

  const draw = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      if (!isDrawing || isDisabled) return;
      e.preventDefault();

      const coords = getCoordinates(e);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    },
    [isDrawing, getCoordinates, isDisabled],
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
      const rect = canvas.getBoundingClientRect();

      ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    setHasSigned(false);
  }, [isDisabled]);

  const getSignatureDataURL = useCallback((): string => {
    const canvas = canvasRef.current;

    return canvas ? canvas.toDataURL("image/png") : "";
  }, []);

  return {
    canvasRef,
    hasSigned,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    getSignatureDataURL,
  };
};

// Hook para manejo de firmas existentes
export const useFirmasExistentes = () => {
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

// Componente principal mejorado
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
      periodo: `${MonthAndYear(liquidacionData.periodo_end)}`,
      nomina: `${formatDate(liquidacionData.periodo_start)} - ${formatDate(liquidacionData.periodo_end)}`,
      id: liquidacionData.id,
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
      handleGeneratePDF(liquidacionData);
    }
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
  info: { nombreCompleto: string; periodo: string; id: string };
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
        label="Período"
        value={info.periodo}
      />
      <InfoItem
        documentoFirmado={documentoFirmado}
        label="ID"
        value={info.id}
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
}: {
  firmas: FirmaConUrl[];
  onViewDocument: () => void;
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
            Este desprendible de nómina ya ha sido firmado digitalmente. Puede
            proceder a visualizar o descargar el documento.
          </p>
        </div>
      </div>
    </div>

    <FirmasExistentes firmas={firmas} />

    <Button
      className="w-full"
      color="primary"
      startContent={<EyeIcon className="h-4 w-4" />}
      onPress={onViewDocument}
    >
      Ver Documento
    </Button>
  </div>
);

export const SignatureProcess = ({
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
    {canvasSignature.hasSigned && <SignatureConfirmation />}
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
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700" htmlFor="signature">
      Firme en el recuadro de abajo:
    </label>
    <div className="border-2 border-gray-300 rounded-lg bg-white p-2">
      <canvas
        ref={canvasSignature.canvasRef}
        className="cursor-crosshair border border-gray-200 rounded block mx-auto"
        height={CANVAS_CONFIG.height}
        id="signature"
        style={{
          touchAction: "none",
          backgroundColor: CANVAS_CONFIG.backgroundColor,
          width: "100%",
          maxWidth: `${CANVAS_CONFIG.width}px`,
          height: "auto",
        }}
        width={CANVAS_CONFIG.width}
        onMouseDown={canvasSignature.startDrawing}
        onMouseLeave={canvasSignature.stopDrawing}
        onMouseMove={canvasSignature.draw}
        onMouseUp={canvasSignature.stopDrawing}
        onTouchEnd={canvasSignature.stopDrawing}
        onTouchMove={canvasSignature.draw}
        onTouchStart={canvasSignature.startDrawing}
      />
    </div>
    <div className="text-xs text-gray-500 text-center">
      Firme con el mouse o dedo en dispositivos táctiles
    </div>
  </div>
);

const SignatureConfirmation = () => (
  <div className="flex items-center justify-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
    <CheckCircleIcon className="h-4 w-4" />
    <span>Firma capturada correctamente</span>
  </div>
);

const SignatureActions = ({
  canvasSignature,
  isSubmitting,
  onSubmit,
}: {
  canvasSignature: ReturnType<typeof useCanvasSignature>;
  isSubmitting: boolean;
  onSubmit: () => void;
}) => (
  <div className="flex gap-3">
    <Button
      className="flex-1"
      color="danger"
      isDisabled={!canvasSignature.hasSigned}
      startContent={<TrashIcon className="h-4 w-4" />}
      variant="flat"
      onPress={canvasSignature.clearSignature}
    >
      Limpiar
    </Button>
    <Button
      className="flex-1"
      color="primary"
      isDisabled={!canvasSignature.hasSigned}
      isLoading={isSubmitting}
      startContent={!isSubmitting && <CheckCircleIcon className="h-4 w-4" />}
      onPress={onSubmit}
    >
      {isSubmitting ? "Procesando..." : "Confirmar Firma"}
    </Button>
  </div>
);

export const FirmasExistentes = ({ firmas }: { firmas: FirmaConUrl[] }) => {
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

export const SignatureImage = ({ firma }: { firma: FirmaConUrl }) => (
  <div className="mt-2">
    {firma.urlLoading && <LoadingImage />}
    {firma.urlError && <ErrorImage />}
    {firma.presignedUrl && !firma.urlLoading && !firma.urlError && (
      <div>
        <Image
          alt="Firma digital"
          className="mx-auto"
          height={300}
          src={firma.presignedUrl}
          width={300}
        />
      </div>
    )}
  </div>
);

const LoadingImage = () => (
  <div className="w-[150px] h-[50px] bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
  </div>
);

const ErrorImage = () => (
  <div className="w-[150px] h-[50px] bg-red-100 rounded-lg flex items-center justify-center">
    <span className="text-xs text-red-600">Error al cargar</span>
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
