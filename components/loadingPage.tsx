"use client";

import React, { useEffect } from 'react';

const LoadingPage = () => {
  // Opcional: Añadir alguna lógica de tiempo para mostrar mensajes diferentes
  // si la carga toma demasiado tiempo
  useEffect(() => {
    // Puedes implementar alguna lógica aquí si lo deseas
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        {/* Círculo animado con pulso */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-2 border-b-2 border-emerald-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-r-2 border-transparent border-opacity-50 animate-pulse"></div>
        </div>
        
        {/* Texto animado con fade-in */}
        <div className="mt-6 opacity-0 animate-fadeIn">
          <p className="text-gray-600 dark:text-gray-300">Cargando</p>
          <div className="flex justify-center mt-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mx-1 animate-bounce"></span>
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;