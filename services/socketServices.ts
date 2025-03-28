// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

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
      console.log('Socket ya está conectado');
      return;
    }

    // Guardar el userId para intentos de reconexión
    this.userId = userId;

    // Configuración para la conexión
    const socketUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log(socketUrl)
    try {
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'], // Intentar websocket primero, luego polling
        timeout: 10000, // 10 segundos de timeout
        reconnectionAttempts: 3, // Socket.io intentará reconectar 3 veces
        reconnectionDelay: 1000, // 1 segundo entre intentos
        query: { userId },
        withCredentials: true, // Importante para enviar cookies en solicitudes cross-domain
      });

      // Manejadores de eventos de conexión
      this.socket.on('connect', this.handleConnect);
      this.socket.on('connect_error', this.handleConnectError);
      this.socket.on('disconnect', this.handleDisconnect);
      this.socket.on('error', this.handleError);

      console.log('Iniciando conexión socket para el usuario:', userId);
    } catch (error) {
      console.error('Error al inicializar el socket:', error);
    }
  }

  // Manejador de conexión exitosa
  private handleConnect = () => {
    console.log('Socket conectado exitosamente');
    this.reconnectAttempts = 0; // Resetear conteo de intentos al conectar
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  };

  // Manejador de error de conexión
  private handleConnectError = (error: Error) => {
    console.error('Error de conexión socket:', error);
    
    // Si estamos usando el transporte polling y falla, intentemos solo websocket
    if (this.socket && this.socket.io.opts.transports?.includes('polling' as any)) {
            console.log('Intentando conectar solo con websocket...');
      this.disconnect();
      
      // Intentar reconectar con solo websocket después de un retraso
      this.attemptReconnect();
    }
  };

  // Manejador de desconexión
  private handleDisconnect = (reason: string) => {
    console.log('Socket desconectado:', reason);
    
    // Intentar reconectar si la desconexión no fue intencional
    if (reason !== 'io client disconnect' && this.userId) {
      this.attemptReconnect();
    }
  };

  // Manejador de errores generales
  private handleError = (error: Error) => {
    console.error('Error en el socket:', error);
  };

  // Lógica de reconexión manual
  private attemptReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      
      // Calcular retraso exponencial
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(`Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        console.log(`Reconectando socket para el usuario: ${this.userId}`);
        if (this.userId) {
          // En el último intento, probar solo con websocket
          if (this.reconnectAttempts === this.maxReconnectAttempts) {
            this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://midominio.local:5000', {
              transports: ['websocket'], // Solo usar websocket como último recurso
              timeout: 10000,
              query: { userId: this.userId },
              withCredentials: true,
            });
          } else {
            this.connect(this.userId);
          }
        }
      }, delay);
    } else {
      console.error('No se pudo reconectar después de varios intentos');
    }
  };

  // Enviar evento al servidor
  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('No se puede emitir evento, socket no conectado:', event);
    }
  }

  // Escuchar evento del servidor
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('No se puede escuchar evento, socket no inicializado:', event);
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