"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  FilePlus,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import toast from "react-hot-toast";
import { useMediaQuery } from "react-responsive";

import LiquidacionForm from "./liquidacionForm";
import LoadingPage from "./loadingPage";

import { formatToCOP, formatDate } from "@/helpers/helpers";
import { Liquidacion, useNomina } from "@/context/NominaContext";

const LiquidacionPage = ({ mode = "create" }) => {
  const router = useRouter();
  const params = useParams();

  const {
    liquidacionActual,
    obtenerLiquidacionPorId,
    crearLiquidacion,
    editarLiquidacion,
    obtenerLiquidaciones,
    loading: nominaLoading,
  } = useNomina();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 1024 });

  // Obtener la liquidación actual cuando se monta el componente y estamos en modo edición
  useEffect(() => {
    if (mode === "edit" && params.id) {
      const fetchLiquidacion = async () => {
        setLoading(true);
        try {
          const resultado = await obtenerLiquidacionPorId(String(params.id));

          if (!resultado) {
            router.push("/conductores");
          }
        } catch (error: any) {
          toast.error(error.message || "Error al obtener liquidación por id");
        } finally {
          setLoading(false);
        }
      };

      fetchLiquidacion();
    } else {
      setLoading(false);
    }
  }, [mode, params?.id, obtenerLiquidacionPorId, router]);

  // Manejar creación/actualización de liquidación
  const handleSubmit = async (liquidacionData: Liquidacion) => {
    setSaving(true);

    try {
      if (mode === "edit" && liquidacionActual?.id) {
        await editarLiquidacion(liquidacionActual.id, liquidacionData);
      } else {
        await crearLiquidacion(liquidacionData);
      }

      await obtenerLiquidaciones();
      router.push("/conductores");
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error al ${mode === "create" ? "crear" : "actualizar"} la liquidación. Por favor intente nuevamente.`,
      );
    } finally {
      setSaving(false);
    }
  };

  // Volver a la página anterior
  const handleBack = () => {
    router.back();
  };

  // Mostrar pantalla de carga
  if (loading || nominaLoading) {
    return (
      <LoadingPage>
        {params.id ? "Obteniendo liquidación" : "Cargando formulario"}
      </LoadingPage>
    );
  }

  // Mostrar error si estamos editando y no hay liquidación
  if (mode === "edit" && !liquidacionActual) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No se pudo cargar la liquidación
            </h2>
            <p className="text-gray-600 mb-6">
              La liquidación solicitada no existe o ha sido eliminada
            </p>
            <Button
              className="bg-emerald-600 text-white"
              color="primary"
              startContent={<ArrowLeft size={18} />}
              variant="flat"
              onPress={handleBack}
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-md">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FilePlus className="mr-2 text-emerald-600" size={20} />
            {mode === "create" ? "Nueva Liquidación" : "Editar Liquidación"}
          </h2>

          <div className="flex max-sm:w-full items-center gap-3">
            {mode === "edit" && liquidacionActual && (
              <div className="flex items-center gap-3">
                <Chip
                  className={`${liquidacionActual.estado === "Liquidado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} rounded-lg h-8`}
                >
                  <div className="flex items-center">
                    {liquidacionActual.estado === "Liquidado" ? (
                      <Check className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {liquidacionActual.estado}
                  </div>
                </Chip>
              </div>
            )}
            <Button
              color="primary"
              fullWidth={isMobile}
              startContent={<ArrowLeft size={16} />}
              onPress={handleBack}
            >
              Volver
            </Button>
          </div>
        </div>

        {/* Información rápida para edición */}
        {mode === "edit" && liquidacionActual && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Conductor</div>
                  <div className="text-sm font-medium">
                    {liquidacionActual.conductor?.nombre}{" "}
                    {liquidacionActual.conductor?.apellido}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Período</div>
                  <div className="text-sm font-medium">
                    {formatDate(liquidacionActual.periodo_start)} -{" "}
                    {formatDate(liquidacionActual.periodo_end)}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-sm font-medium text-emerald-600">
                    {formatToCOP(liquidacionActual.sueldo_total)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de liquidación */}
        <div className="p-2">
          <LiquidacionForm
            initialData={mode === "edit" ? liquidacionActual : null}
            loading={saving}
            mode={mode}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default LiquidacionPage;
