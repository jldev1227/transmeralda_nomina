"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
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

import { apiClient } from "@/config/apiClient";
import { formatDate } from "@/helpers/helpers";
import { Liquidacion } from "@/context/NominaContext";
import handleGeneratePDF from "@/components/pdfMaker";

interface FirmaExistente {
  id: string;
  fecha_firma: string;
  estado: string;
  conductor: {
    nombre: string;
    apellido: string;
    numero_identificacion: string;
  };
}

export default function Page() {
  const params = useParams();
  const liquidacionId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [liquidacionData, setLiquidacionData] = useState<Liquidacion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para manejo de firmas existentes
  const [firmasExistentes, setFirmasExistentes] = useState<FirmaExistente[]>(
    [],
  );
  const [documentoFirmado, setDocumentoFirmado] = useState(false);
  const [checkingFirmas, setCheckingFirmas] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchLiquidacion = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get(`/api/nomina/conductores/${id}`);

      if (data?.data) {
        const liquidacionData = data.data;

        setLiquidacionData(liquidacionData);
      }
    } catch (error) {
      console.error(`Error fetching liquidacion with ID ${id}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirmasExistentes = async (liquidacionId: string) => {
    try {
      setCheckingFirmas(true);
      const { data } = await apiClient.get(
        `/api/firmas_desprendible/liquidacion/${liquidacionId}`,
      );

      if (data?.success && data?.data) {
        const firmasActivas = data.data.filter(
          (firma: any) => firma.estado === "Activa",
        );

        setFirmasExistentes(firmasActivas);
        setDocumentoFirmado(firmasActivas.length > 0);

        console.log("Firmas encontradas:", firmasActivas.length);
      }
    } catch (error) {
      console.error("Error verificando firmas existentes:", error);
      // Si hay error, asumimos que no hay firmas y permitimos firmar
      setDocumentoFirmado(false);
      setFirmasExistentes([]);
    } finally {
      setCheckingFirmas(false);
    }
  };

  useEffect(() => {
    if (liquidacionId) {
      fetchLiquidacion(liquidacionId);
      checkFirmasExistentes(liquidacionId);
    }
  }, [liquidacionId]);

  // Canvas setup (solo si no está firmado)
  useEffect(() => {
    if (documentoFirmado) return; // No configurar canvas si ya está firmado

    const canvas = canvasRef.current;

    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.imageSmoothingEnabled = true;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    };

    const timer = setTimeout(setupCanvas, 100);

    window.addEventListener("resize", setupCanvas);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [documentoFirmado]);

  const getCoordinates = (
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
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);

    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setHasSigned(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    setHasSigned(false);
  };

  const getSignatureDataURL = (): string => {
    const canvas = canvasRef.current;

    return canvas ? canvas.toDataURL("image/png") : "";
  };

  const handleSubmitSignature = async () => {
    if (!hasSigned) return;

    setIsSubmitting(true);
    try {
      const signatureData = getSignatureDataURL();

      const { data } = await apiClient.post(
        `/api/firmas_desprendible/crear/${liquidacionId}`,
        {
          signatureData,
          conductorId: liquidacionData?.conductor.id,
        },
      );

      console.log("Firma creada exitosamente:", data);

      // Actualizar estado local
      setDocumentoFirmado(true);
      onOpen(); // Mostrar modal de éxito

      // Recargar firmas existentes
      await checkFirmasExistentes(liquidacionId);
    } catch (error) {
      console.error("Error al enviar la firma:", error);
      // Aquí podrías mostrar un toast o mensaje de error
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewDocument = () => {
    console.log("Visualizando documento...");
    // Implementar lógica de visualización

    handleGeneratePDF(liquidacionData);
  };

  const formatFechaFirma = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || checkingFirmas) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">
            {documentoFirmado
              ? "Documento Firmado"
              : "Firma de Desprendible de Nómina"}
          </h1>
          <p className="text-gray-600">
            {documentoFirmado
              ? "El documento ya ha sido firmado digitalmente"
              : "Complete el proceso de firma para acceder a su desprendible de pago"}
          </p>
        </div>

        {/* Card principal */}
        <Card className="w-full">
          <CardHeader className="pb-3">
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
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* Información del conductor */}
            {liquidacionData && (
              <div
                className={`p-4 rounded-lg ${documentoFirmado ? "bg-green-50" : "bg-emerald-50"}`}
              >
                <h3
                  className={`font-medium mb-2 ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
                >
                  Información del Conductor
                </h3>
                <div>
                  <p>
                    <span
                      className={`font-medium ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
                    >
                      Nombre:
                    </span>{" "}
                    {liquidacionData.conductor.nombre}{" "}
                    {liquidacionData.conductor.apellido}
                  </p>
                  <p>
                    <span
                      className={`font-medium ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
                    >
                      Período:
                    </span>{" "}
                    {formatDate(liquidacionData.periodo_start)} -{" "}
                    {formatDate(liquidacionData.periodo_end)}
                  </p>
                  <p>
                    <span
                      className={`font-medium ${documentoFirmado ? "text-green-600" : "text-emerald-600"}`}
                    >
                      ID:
                    </span>{" "}
                    {liquidacionData.id}
                  </p>
                </div>
              </div>
            )}

            {/* Estado del documento */}
            {documentoFirmado ? (
              // Documento ya firmado
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">
                        Documento Firmado Exitosamente
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Este desprendible de nómina ya ha sido firmado
                        digitalmente. Puede proceder a visualizar o descargar el
                        documento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de la firma */}
                {firmasExistentes.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Detalles de la Firma
                    </h4>
                    {firmasExistentes.map((firma) => (
                      <div
                        key={firma.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {firma.conductor.nombre}{" "}
                              {firma.conductor.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                              Firmado el {formatFechaFirma(firma.fecha_firma)}
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
                    ))}
                  </div>
                )}

                {/* Acciones disponibles */}
                <div className="space-y-3">
                  <div>
                    <Button
                      className="w-full"
                      color="primary"
                      startContent={<EyeIcon className="h-4 w-4" />}
                      onPress={viewDocument}
                    >
                      Ver Documento
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Proceso de firma
              <>
                {/* Instrucciones */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        Importante
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Para poder visualizar o descargar su desprendible de
                        nómina, debe firmar digitalmente confirmando que ha
                        recibido el documento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Canvas de firma */}
                <div className="space-y-3">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="signature"
                  >
                    Firme en el recuadro de abajo:
                  </label>
                  <div className="border-2 border-gray-300 rounded-lg bg-white p-2">
                    <canvas
                      ref={canvasRef}
                      className="cursor-crosshair border border-gray-200 rounded block mx-auto"
                      height="256"
                      id="signature"
                      style={{
                        touchAction: "none",
                        backgroundColor: "white",
                        width: "100%",
                        maxWidth: "600px",
                        height: "auto",
                      }}
                      width="600"
                      onMouseDown={startDrawing}
                      onMouseLeave={stopDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onTouchEnd={stopDrawing}
                      onTouchMove={draw}
                      onTouchStart={startDrawing}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Firme con el mouse o dedo en dispositivos táctiles
                  </div>
                </div>

                {/* Estado de la firma */}
                {hasSigned && (
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Firma capturada correctamente</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    color="danger"
                    isDisabled={!hasSigned}
                    startContent={<TrashIcon className="h-4 w-4" />}
                    variant="flat"
                    onPress={clearSignature}
                  >
                    Limpiar
                  </Button>
                  <Button
                    className="flex-1"
                    color="primary"
                    isDisabled={!hasSigned}
                    isLoading={isSubmitting}
                    startContent={
                      !isSubmitting && <CheckCircleIcon className="h-4 w-4" />
                    }
                    onPress={handleSubmitSignature}
                  >
                    {isSubmitting ? "Procesando..." : "Confirmar Firma"}
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Modal de confirmación */}
        <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
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
                    <p className="text-sm text-green-800">
                      ✓ Firma digital registrada
                      <br />
                      ✓ Documento disponible para visualización
                      <br />
                      ✓ Descarga habilitada
                      <br />✓ Registro de auditoría creado
                    </p>
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
                      viewDocument();
                    }}
                  >
                    Ver Documento
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
