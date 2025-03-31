"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Loader2, Mail, MailsIcon, X, WifiOff, RefreshCw } from "lucide-react";
import {
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

import socketService from "@/services/socketServices";
import { EmailData, useNomina } from "@/context/NominaContext";
import { apiClient } from "@/config/apiClient";
import { useNotificaciones } from "@/hooks/useNotificaciones";

// Interfaz para la información del usuario almacenada en la cookie
interface UserInfo {
  id: string;
  nombre: string;
  correo: string;
  role: string;
  permisos: {
    admin: boolean;
    flota: boolean;
    nomina: boolean;
    [key: string]: boolean;
  };
}

// Estados posibles del trabajo de envío
type JobStatus = "idle" | "queued" | "processing" | "completed" | "failed";

interface EmailSenderProps {
  selectedIds: string[];
}

const EmailSender = ({ selectedIds }: EmailSenderProps) => {
  const { liquidaciones, generatePDFS } = useNomina();
  const { notificarCRUD } = useNotificaciones();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [progress, setProgress] = useState({
    current: 0,
    total: 1,
    message: "Preparando...",
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketAttempted, setSocketAttempted] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    "Desprendible de nómina - Transmeralda",
  );
  const [emailBody, setEmailBody] = useState(`Estimado conductor,
  
Adjunto encontrará su desprendible de nómina correspondiente al período actual.
  
Por favor, revise el documento y si tiene alguna duda o inquietud, no dude en contactarnos.
  
Saludos cordiales,
Equipo de Nómina
Transportes y Servicios Esmeralda S.A.S ZOMAC`);

  // Obtener el userInfo de la cookie al montar el componente
  useEffect(() => {
    const userInfoStr = Cookies.get("userInfo");

    if (userInfoStr) {
      try {
        const parsedUserInfo: UserInfo = JSON.parse(userInfoStr);

        setUserInfo(parsedUserInfo);
      } catch (error: any) {
        toast.error(
          `Error: ${error.message ? error.message : "No se pudo obtener información del usuario"}`,
        );
      }
    } else {
    }
  }, []);

  // Intentar conectar el socket cuando se abre el modal
  useEffect(() => {
    // Solo conectar si el modal está abierto y tenemos userInfo
    if (isOpen && userInfo && userInfo.id) {
      // Suscribirse a eventos de conexión/desconexión
      const handleSocketConnect = () => {
        console.log("socket CONTECT");
        setSocketConnected(true);
      };

      const handleSocketDisconnect = () => {
        console.log("socket DISCONNECT");
        setSocketConnected(false);
      };

      // Conectar con el ID del usuario
      socketService.connect(userInfo.id);
      setSocketAttempted(true);

      // Registrar listeners para eventos
      socketService.on("connect", handleSocketConnect);
      socketService.on("disconnect", handleSocketDisconnect);
      socketService.on("job:progress", handleJobProgress);
      socketService.on("job:completed", handleJobCompleted);
      socketService.on("job:failed", handleJobFailed);

      // Verificar si ya está conectado
      if (socketService.isConnected()) {
        setSocketConnected(true);
      }

      // Limpiar al desmontar
      return () => {
        socketService.off("connect");
        socketService.off("disconnect");
        socketService.off("job:progress");
        socketService.off("job:completed");
        socketService.off("job:failed");

        // Solo desconectar si no hay un trabajo activo
        if (status !== "processing" && status !== "queued") {
          socketService.disconnect();
        }
      };
    }
  }, [isOpen, userInfo, status]);

  // Si hay un jobId, verificar el estado periódicamente como respaldo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (
      jobId &&
      (status === "queued" || status === "processing" || status === "completed")
    ) {
      // // Crear un intervalo para verificar el estado del trabajo
      intervalId = setInterval(async () => {
        try {
          const response = await apiClient.get(`/api/pdf/job-status/${jobId}`);
          const jobData = response.data.data;

          setStatus(jobData.status as JobStatus);
          setProgress({
            current: Math.round((jobData.progress / 100) * jobData.totalEmails),
            total: jobData.totalEmails || selectedIds.length,
            message: getStatusMessage(jobData.status),
          });

          // Si el trabajo terminó, limpiar el intervalo
          if (jobData.status === "completed" || jobData.status === "failed") {
            clearInterval(intervalId);

            if (jobData.status === "completed") {
              notificarCRUD("enviar", "correos", true);

              // Cerrar modal después de un tiempo
              setTimeout(() => {
                setSending(false);
                setJobId(null);
                handleClose();
              }, 3000);
            } else if (jobData.status === "failed") {
              toast.error(
                `Error: ${jobData.error || "No se pudo completar el envío"}`,
              );
              setSending(false);
              setJobId(null);
            }
          }
        } catch (error) {
          console.error("Error al consultar estado del trabajo:", error);
        }
      }, 3000); // Verificar cada 3 segundos
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, status, selectedIds.length]);

  // Manejadores de eventos socket
  const handleJobProgress = (data: { jobId: string; progress: number }) => {
    if (data.jobId === jobId) {
      setStatus("processing");
      setProgress({
        current: Math.floor((data.progress / 100) * selectedIds.length),
        total: selectedIds.length,
        message: "Procesando liquidaciones...",
      });
    }
  };

  const handleJobCompleted = (data: { jobId: string; result: any }) => {
    if (data.jobId === jobId) {
      const newStatus = "completed";

      setStatus(newStatus);
      setProgress({
        current: selectedIds.length,
        total: selectedIds.length,
        message: "¡Envío completado!",
      });

      notificarCRUD("enviar", "correos", true);

      console.log("completed 2", newStatus);
      // Cerrar modal después de un tiempo
      setTimeout(() => {
        setSending(false);
        setJobId(null);
        handleClose(newStatus); // Pasar el estado actualizado como parámetro
      }, 3000);
    }
  };

  const handleJobFailed = (data: { jobId: string; error: string }) => {
    if (data.jobId === jobId) {
      setStatus("failed");
      toast.error(`Error: ${data.error || "No se pudo completar el envío"}`);
      setSending(false);
      setJobId(null);
    }
  };

  // Obtener mensaje según el estado del trabajo
  const getStatusMessage = (jobStatus: JobStatus): string => {
    console.log(jobStatus, "status");
    switch (jobStatus) {
      case "idle":
        return "Listo para enviar";
      case "queued":
        return "En cola para procesamiento...";
      case "processing":
        return "Procesando liquidaciones...";
      case "completed":
        return "¡Envío completado!";
      case "failed":
        return "Error en el envío";
      default:
        return "Estado desconocido";
    }
  };

  // Calcular los emails de los destinatarios
  const destinatariosEmails = liquidaciones
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.conductor?.email)
    .filter(Boolean) as string[];

  const handleOpen = () => setIsOpen(true);

  const handleClose = (currentStatus?: JobStatus) => {
    // Usar el parámetro si está disponible, de lo contrario usar el estado
    const statusToCheck = currentStatus || status;

    // Si hay un envío en curso, pedir confirmación
    if (sending && statusToCheck !== "completed") {
      const confirmar = window.confirm(
        "¿Estás seguro de que deseas cancelar el envío en curso?",
      );

      if (!confirmar) return;
    }

    setIsOpen(false);
  };

  // Intentar reconectar el socket manualmente
  const reconnectSocket = () => {
    if (userInfo && userInfo.id) {
      toast.success("Intentando reconectar...");
      socketService.disconnect();

      // Pequeña pausa antes de reintentar
      setTimeout(() => {
        socketService.connect(userInfo.id);
      }, 500);
    }
  };

  // Enviar correos con los PDFs adjuntos
  const sendEmails = async () => {
    if (selectedIds.length === 0) {
      toast.error("No hay liquidaciones seleccionadas");

      return;
    }

    setSending(true);
    setStatus("queued");
    setProgress({
      current: 0,
      total: selectedIds.length,
      message: "Preparando envíos...",
    });

    try {
      // 1. Obtener las liquidaciones seleccionadas
      const selectedLiquidaciones = liquidaciones.filter((item) =>
        selectedIds.includes(item.id),
      );

      // 2. Verificar que todos los conductores tengan correo electrónico
      const missingEmails = selectedLiquidaciones.filter(
        (item) => !item.conductor?.email,
      );

      if (missingEmails.length > 0) {
        const names = missingEmails
          .map(
            (item) =>
              `${item.conductor?.nombre || ""} ${item.conductor?.apellido || ""}`,
          )
          .join(", ");

        toast.error(
          `Los siguientes conductores no tienen correo electrónico: ${names}`,
        );
        setSending(false);
        setStatus("idle");

        return;
      }

      // 3. Preparar datos del email
      const emailData: EmailData = {
        subject: emailSubject,
        body: emailBody,
        recipients: destinatariosEmails,
      };

      // Check for null before assigning
      const jobId = await generatePDFS(selectedIds, emailData);

      if (jobId) {
        setJobId(jobId);
      } else {
        // Handle the null case
        notificarCRUD("generar", "pdf", false);
        // You might want to stop execution or take other actions here
      }
    } catch (error: any) {
      toast.error(
        `Error: ${error.message || "Error desconocido al enviar emails"}`,
      );
      setStatus("failed");
      setSending(false);
    }
  };

  // Determinar si el botón de envío debe estar deshabilitado
  const isSubmitDisabled = (): boolean | undefined => {
    if (
      sending || // Ya se está enviando
      selectedIds.length === 0 || // No hay liquidaciones seleccionadas
      (!socketConnected && socketAttempted)
    )
      return;
    // Se intentó conectar socket pero falló
  };

  return (
    <>
      <Button className="rounded-md" color="primary" onPress={handleOpen}>
        <MailsIcon />
        Enviar desprendibles ({selectedIds.length})
      </Button>

      <Modal
        isOpen={isOpen}
        size="5xl"
        onClose={handleClose}
        onOpenChange={setIsOpen}
      >
        <ModalContent>
          <ModalHeader className="flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2">
              <MailsIcon className="h-6 w-6" />
              Enviar desprendibles por correo
            </div>
            {socketAttempted && !socketConnected && (
              <div className="flex items-center md:ml-auto text-xs text-amber-500">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Sin actualizaciones en tiempo real</span>
                <Button
                  isIconOnly
                  className="ml-2 p-1"
                  size="sm"
                  variant="light"
                  onPress={reconnectSocket}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}
          </ModalHeader>
          <ModalBody className="flex gap-2">
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Destinatarios: {selectedIds.length} liquidaciones
                  seleccionadas
                </span>
              </div>

              <div className="flex md:flex-wrap py-3 gap-2 max-md:overflow-x-scroll max-w-full">
                {destinatariosEmails.length > 0 ? (
                  destinatariosEmails.map((email, idx) => (
                    <Chip key={idx} color="primary" size="sm">
                      {email}
                    </Chip>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    No hay destinatarios con correo electrónico
                  </span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="asunto">
                  Asunto del correo:
                </label>
                <Input
                  className="mt-1"
                  disabled={sending}
                  id="asunto"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="body">
                  Cuerpo del correo:
                </label>
                <Textarea
                  className="mt-1"
                  disabled={sending}
                  id="body"
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              {sending && (
                <div className="bg-slate-50 rounded-md p-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {progress.message}
                    </span>
                    <span className="text-sm text-slate-500">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              className="bg-red-100 text-red-800"
              disabled={
                sending &&
                status === "processing" &&
                progress.current < progress.total
              }
              onPress={() => handleClose(status)}
            >
              <X className="h-4 w-4 mr-2" />
              {sending && status === "processing"
                ? "Procesando..."
                : "Cancelar"}
            </Button>

            <Button
              className="bg-emerald-600 text-white"
              disabled={isSubmitDisabled()}
              onPress={sendEmails}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Liquidaciones
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmailSender;
