// src/services/socketService.ts
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 segundos iniciales
  private reconnectTimer: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  // Método para conectar con el socket
  connect(userId: string): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    // Guardar el userId para intentos de reconexión
    this.userId = userId;

    // Configuración para la conexión
    const socketUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"], // Intentar websocket primero, luego polling
        timeout: 10000, // 10 segundos de timeout
        reconnectionAttempts: 3, // Socket.io intentará reconectar 3 veces
        reconnectionDelay: 1000, // 1 segundo entre intentos
        query: { userId },
        withCredentials: true, // Importante para enviar cookies en solicitudes cross-domain
      });

      // Manejadores de eventos de conexión
      this.socket.on("connect", this.handleConnect);
      this.socket.on("connect_error", this.handleConnectError);
      this.socket.on("disconnect", this.handleDisconnect);
      this.socket.on("error", this.handleError);
    } catch (error: any) {
      toast.error(error ? error.message : "Error al conectar con el socket");
    }
  }

  // Manejador de conexión exitosa
  private handleConnect = () => {
    this.reconnectAttempts = 0; // Resetear conteo de intentos al conectar
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  };

  // Manejador de error de conexión
  private handleConnectError = () => {
    // Si estamos usando el transporte polling y falla, intentemos solo websocket
    if (
      this.socket &&
      this.socket.io.opts.transports?.includes("polling" as any)
    ) {
      this.disconnect();

      // Intentar reconectar con solo websocket después de un retraso
      this.attemptReconnect();
    }
  };

  // Manejador de desconexión
  private handleDisconnect = (reason: string) => {
    // Intentar reconectar si la desconexión no fue intencional
    if (reason !== "io client disconnect" && this.userId) {
      this.attemptReconnect();
    }
  };

  // Manejador de errores generales
  private handleError = () => {};

  // Lógica de reconexión manual
  private attemptReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;

      // Calcular retraso exponencial
      const delay =
        this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

      this.reconnectTimer = setTimeout(() => {
        if (this.userId) {
          // En el último intento, probar solo con websocket
          if (this.reconnectAttempts === this.maxReconnectAttempts) {
            this.socket = io(
              process.env.NEXT_PUBLIC_SOCKET_URL ||
                "http://midominio.local:5000",
              {
                transports: ["websocket"], // Solo usar websocket como último recurso
                timeout: 10000,
                query: { userId: this.userId },
                withCredentials: true,
              },
            );
          } else {
            this.connect(this.userId);
          }
        }
      }, delay);
    } else {
    }
  };

  // Enviar evento al servidor
  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
    }
  }

  // Escuchar evento del servidor
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
    }
  }

  // Dejar de escuchar evento
  off(event?: string): void {
    if (this.socket) {
      if (event) {
        this.socket.off(event);
      } else {
        this.socket.removeAllListeners();
      }
    }
  }

  // Desconectar socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Limpiar el timer de reconexión si existe
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // Verificar estado de conexión
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
}

// Exportar una instancia singleton
const socketService = new SocketService();

export default socketService;
