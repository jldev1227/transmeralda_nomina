// components/SocketMonitor.tsx
"use client";
import React, { useState, useEffect } from "react";

import socketService from "@/services/socketServices";
import { useAuth } from "@/context/AuthContext";

interface SocketEvent {
  eventName: string;
  data: any;
  timestamp: Date;
  isNew: boolean; // Para marcar eventos nuevos y que destaquen visualmente
}

const SocketMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<SocketEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // Verificar conexión inicial
      const checkConnection = () => {
        const connected = socketService.isConnected();

        setIsConnected(connected);
      };

      checkConnection();

      // Manejar eventos de conexión
      const handleConnect = () => {
        setIsConnected(true);

        // Registrar evento de conexión
        addEvent("connect", { message: "Conectado al servidor de Socket.IO" });
      };

      const handleDisconnect = (reason: string) => {
        setIsConnected(false);

        // Registrar evento de desconexión
        addEvent("disconnect", { reason });
      };

      // Escuchar eventos específicos de liquidaciones
      const handleLiquidacionCreada = (data: any) => {
        addEvent("liquidacion_creada", data);
      };

      const handleLiquidacionActualizada = (data: any) => {
        addEvent("liquidacion_actualizada", data);
      };

      const handleLiquidacionEliminada = (data: any) => {
        addEvent("liquidacion_eliminada", data);
      };

      const handleCambioEstado = (data: any) => {
        addEvent("cambio_estado_liquidacion", data);
      };

      // Registrar listeners
      socketService.on("connect", handleConnect);
      socketService.on("disconnect", handleDisconnect);
      socketService.on("liquidacion_creada", handleLiquidacionCreada);
      socketService.on("liquidacion_actualizada", handleLiquidacionActualizada);
      socketService.on("liquidacion_eliminada", handleLiquidacionEliminada);
      socketService.on("cambio_estado_liquidacion", handleCambioEstado);

      return () => {
        // Limpiar listeners
        socketService.off("connect");
        socketService.off("disconnect");
        socketService.off("liquidacion_creada");
        socketService.off("liquidacion_actualizada");
        socketService.off("liquidacion_eliminada");
        socketService.off("cambio_estado_liquidacion");
      };
    }
  }, [user?.id]);

  // Añadir un nuevo evento al registro
  const addEvent = (eventName: string, data: any) => {
    const newEvent = {
      eventName,
      data,
      timestamp: new Date(),
      isNew: true,
    };

    setEvents((prev) => [newEvent, ...prev.slice(0, 19)]); // Mantener máximo 20 eventos
    setNewEventsCount((prev) => prev + 1);

    // Marcar evento como "visto" después de 5 segundos
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((event) =>
          event === newEvent ? { ...event, isNew: false } : event,
        ),
      );
    }, 5000);
  };

  // Limpiar los eventos
  const clearEvents = () => {
    setEvents([]);
    setNewEventsCount(0);
  };

  // Formatear hora para mostrar en la UI
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Resetear contador de nuevos eventos cuando se expande
  useEffect(() => {
    if (isExpanded) {
      setNewEventsCount(0);
    }
  }, [isExpanded]);

  // Obtener el nombre apropiado para el usuario que realizó la acción
  const getUserNameFromEvent = (event: SocketEvent) => {
    switch (event.eventName) {
      case "liquidacion_creada":
        return event.data.usuarioCreador;
      case "liquidacion_actualizada":
        return event.data.usuarioActualizador;
      case "liquidacion_eliminada":
        return event.data.usuarioEliminador;
      case "cambio_estado_liquidacion":
        return event.data.usuarioResponsable;
      default:
        return "Sistema";
    }
  };

  // Obtener un resumen del evento
  const getEventSummary = (event: SocketEvent) => {
    switch (event.eventName) {
      case "liquidacion_creada":
        return `Nueva liquidación #${event.data.liquidacion.id} para ${event.data.liquidacion.conductor.nombre}`;
      case "liquidacion_actualizada":
        return `Liquidación #${event.data.liquidacion.id} actualizada`;
      case "liquidacion_eliminada":
        return `Liquidación #${event.data.liquidacionId} eliminada`;
      case "cambio_estado_liquidacion":
        return `Liquidación #${event.data.liquidacionId}: ${event.data.estadoAnterior} → ${event.data.nuevoEstado}`;
      case "connect":
        return "Conectado al servidor";
      case "disconnect":
        return `Desconectado: ${event.data.reason}`;
      default:
        return event.eventName;
    }
  };

  // Calcular color de badge según tipo de evento
  const getBadgeColor = (eventName: string) => {
    switch (eventName) {
      case "liquidacion_creada":
        return "bg-green-500";
      case "liquidacion_actualizada":
        return "bg-blue-500";
      case "liquidacion_eliminada":
        return "bg-red-500";
      case "cambio_estado_liquidacion":
        return "bg-purple-500";
      case "connect":
        return "bg-green-500";
      case "disconnect":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón de monitor flotante */}
      <button
        className={`relative flex items-center justify-center text-white rounded-full p-3 shadow-lg ${isConnected ? "bg-green-600" : "bg-red-600"}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icono de conexión */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>

        {/* Badge de notificación */}
        {newEventsCount > 0 && !isExpanded && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {newEventsCount}
          </span>
        )}
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Cabecera */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100">
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <h3 className="font-medium">Monitor en tiempo real</h3>
            </div>
            <div className="flex space-x-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                title="Limpiar eventos"
                onClick={clearEvents}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                title="Cerrar"
                onClick={() => setIsExpanded(false)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay eventos registrados aún
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {events.map((event, index) => (
                  <li
                    key={index}
                    className={`p-3 hover:bg-gray-50 transition-colors ${event.isNew ? "bg-yellow-50" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-2">
                        <span
                          className={`text-xs text-white px-2 py-1 rounded-full ${getBadgeColor(event.eventName)}`}
                        >
                          {event.eventName === "liquidacion_creada"
                            ? "Creado"
                            : event.eventName === "liquidacion_actualizada"
                              ? "Actualizado"
                              : event.eventName === "liquidacion_eliminada"
                                ? "Eliminado"
                                : event.eventName ===
                                    "cambio_estado_liquidacion"
                                  ? "Estado"
                                  : event.eventName}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {getEventSummary(event)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Por: {getUserNameFromEvent(event)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pie del panel */}
          <div className="p-2 text-xs text-center text-gray-500 border-t border-gray-200 bg-gray-50">
            {isConnected ? (
              <span className="text-green-600">
                Conectado y escuchando cambios en tiempo real
              </span>
            ) : (
              <span className="text-red-600">
                Desconectado - Intenta recargar la página
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocketMonitor;
