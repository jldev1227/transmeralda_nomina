"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, FilePlus, Calendar, User, DollarSign
} from 'lucide-react';
import { useNomina } from '@/context/NominaContext';
import { formatToCOP, formatDate } from '@/helpers/helpers';
import { Button } from '@nextui-org/button';
import { Badge } from '@nextui-org/badge';
import LiquidacionForm from '@/components/liquidacionForm';


const EditarLiquidacionPage = () => {
  const router = useRouter();
  const params = useParams();
  
  const {
    liquidacionActual,
    obtenerLiquidacionPorId,
    editarLiquidacion,
    loading: nominaLoading,
  } = useNomina();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Obtener la liquidación actual cuando se monta el componente
  useEffect(() => {
    const fetchLiquidacion = async () => {
      if (params.id) {
        setLoading(true);
        try {
          const resultado = await obtenerLiquidacionPorId(params.id as string);
          if (!resultado) {
            console.error('No se encontró la liquidación solicitada');
            router.push('/conductores');
          }
        } catch (err) {
          console.error('Error al cargar la liquidación:', err);
          console.error('Error al cargar la liquidación');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLiquidacion();
  }, [params.id, obtenerLiquidacionPorId, router]);

  // Manejar actualización de liquidación
  const handleUpdate = async (liquidacionData: any) => {
    if (!liquidacionActual?.id) {
      console.error('No se puede editar la liquidación porque no se ha cargado correctamente');
      return;
    }

    setSaving(true);
    try {
      const resultado = await editarLiquidacion(liquidacionActual.id, liquidacionData);
      if (resultado) {
        router.push('/conductores');
      } else {
        console.error('No se pudo actualizar la liquidación');
      }
    } catch (err) {
      console.error('Error al actualizar la liquidación:', err);
      console.error('Error al actualizar la liquidación');
    } finally {
      setSaving(false);
    }
  };

  // Volver a la página anterior
  const handleBack = () => {
    router.back();
  };

  if (loading || nominaLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-emerald-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando liquidación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!liquidacionActual) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No se pudo cargar la liquidación</h2>
            <p className="text-gray-600 mb-6">{'La liquidación solicitada no existe o ha sido eliminada'}</p>
            <Button 
              color="primary" 
              variant="flat"
              onPress={handleBack}
              startContent={<ArrowLeft size={18} />}
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
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FilePlus size={20} className="mr-2 text-emerald-600" />
            Editar Liquidación
          </h2>
          
          <div className="flex items-center gap-3">
            <Badge 
              color={liquidacionActual.estado === 'Liquidado' ? 'success' : 'warning'} 
              variant="flat"
            >
              {liquidacionActual.estado}
            </Badge>
            
            <Button
              size="sm"
              variant="light"
              onPress={handleBack}
              startContent={<ArrowLeft size={16} />}
            >
              Volver
            </Button>
          </div>
        </div>
        
        {/* Información rápida */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Conductor</div>
                <div className="text-sm font-medium">{liquidacionActual.conductor?.nombre} {liquidacionActual.conductor?.apellido}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Período</div>
                <div className="text-sm font-medium">
                  {formatDate(liquidacionActual.periodoStart)} - {formatDate(liquidacionActual.periodoEnd)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-sm font-medium text-emerald-600">
                  {formatToCOP(liquidacionActual.sueldoTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="p-2">
          <LiquidacionForm
            mode="edit" 
            initialData={liquidacionActual}
            onSubmit={handleUpdate}
            loading={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default EditarLiquidacionPage;