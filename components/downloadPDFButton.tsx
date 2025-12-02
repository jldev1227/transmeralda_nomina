"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Download, Loader, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { apiClient } from "@/config/apiClient";

interface DownloadPDFButtonProps {
  selectedIds: string[];
  label?: string;
  buttonClassName?: string;
  buttonProps?: any;
}

const DownloadPDFButton = ({
  selectedIds,
  label = "Descargar PDFs",
  buttonClassName = "bg-blue-600 text-white",
  buttonProps = {},
}: DownloadPDFButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (selectedIds.length === 0) {
      toast.error("Por favor selecciona al menos una liquidación");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(
      `Generando ${selectedIds.length} desprendible(s)...`
    );

    try {
      // Realizar petición al backend
      const response = await apiClient.post(
        "/api/pdf/download",
        {
          liquidacionIds: selectedIds,
        },
        {
          responseType: "blob", // Importante para recibir el archivo
        }
      );

      // Crear un blob del archivo ZIP
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal para descargar el archivo
      const link = document.createElement("a");
      link.href = url;

      // Obtener el nombre del archivo del header o usar uno por defecto
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "desprendibles_nomina.zip";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, "");
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `${selectedIds.length} desprendible(s) descargado(s) exitosamente`,
        { id: toastId }
      );
    } catch (error: any) {
      console.error("Error al descargar PDFs:", error);
      toast.error(
        error.response?.data?.message ||
          "Error al generar los desprendibles. Intenta nuevamente.",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={buttonClassName}
      color="primary"
      disabled={isLoading || selectedIds.length === 0}
      startContent={
        isLoading ? (
          <Loader className="animate-spin" size={16} />
        ) : (
          <FileText size={16} />
        )
      }
      variant="flat"
      onPress={handleDownload}
      {...buttonProps}
    >
      {isLoading ? "Generando..." : label}
    </Button>
  );
};

export default DownloadPDFButton;
