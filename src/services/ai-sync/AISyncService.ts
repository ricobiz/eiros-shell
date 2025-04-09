
import { logService } from '../LogService';
import { AIConnectionService } from './connectionService';
import { AIMessagingService } from './messagingService';
import { AutoReconnectService } from './autoReconnect';
import { ChatGPTWindowManager } from './windowManager';
import { aiSyncEvents } from './events';

class AISyncService {
  private windowManager: ChatGPTWindowManager;
  private connectionService: AIConnectionService;
  private messagingService: AIMessagingService;
  private autoReconnectService: AutoReconnectService;
  private pendingMessages: string[] = [];
  private isConnecting = false;
  
  constructor() {
    this.windowManager = new ChatGPTWindowManager();
    this.connectionService = new AIConnectionService(this.windowManager);
    this.messagingService = new AIMessagingService(this.windowManager);
    this.autoReconnectService = new AutoReconnectService(this.connectionService);
    
    // We'll only start auto-reconnect when a message is explicitly sent
    // to avoid aggressive window opening
  }
  
  isConnected(): boolean {
    return this.connectionService.isConnected();
  }
  
  async connectToAI(): Promise<boolean> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      logService.addLog({
        type: 'info',
        message: 'Connection attempt already in progress',
        timestamp: Date.now()
      });
      return this.isConnected();
    }
    
    this.isConnecting = true;
    
    try {
      const result = await this.connectionService.connectToAI();
      
      // If we successfully connected, maybe start auto-reconnect
      if (result) {
        // Now that the user has explicitly requested a connection,
        // we can set up auto-reconnect
        this.autoReconnectService.setupAutoReconnect();
      }
      
      return result;
    } finally {
      this.isConnecting = false;
    }
  }
  
  disconnectFromAI(): void {
    // First make sure the auto-reconnect is completely stopped
    this.autoReconnectService.stopAutoReconnect();
    
    // Force close any open window
    this.windowManager.closeWindow();
    
    // Finally mark as disconnected
    this.connectionService.disconnectFromAI();
    
    // Clear any pending messages
    this.pendingMessages = [];
    
    logService.addLog({
      type: 'info',
      message: 'Соединение с ChatGPT полностью остановлено',
      timestamp: Date.now()
    });
  }
  
  async sendMessageToAI(message: string): Promise<void> {
    // Queue message first
    this.pendingMessages.push(message);
    
    // If we're not connected, try to connect first
    if (!this.connectionService.isConnected()) {
      // Try to reconnect first
      const connected = await this.connectToAI();
      if (!connected) {
        logService.addLog({
          type: 'warning',
          message: 'Невозможно отправить сообщение: не удалось подключиться к AI',
          timestamp: Date.now()
        });
        return;
      }
    }
    
    // Try to send the first pending message
    if (this.pendingMessages.length > 0) {
      const nextMessage = this.pendingMessages.shift()!;
      this.sendMessageAfterConnection(nextMessage);
    }
  }
  
  private async sendMessageAfterConnection(message: string): Promise<void> {
    logService.addLog({
      type: 'info',
      message: 'Попытка отправить сообщение в ChatGPT',
      timestamp: Date.now()
    });
    
    const success = await this.messagingService.sendMessage(message);
    
    if (!success && this.pendingMessages.length > 0) {
      // If sending failed and we have more messages, try again later
      setTimeout(() => {
        this.sendMessageToAI(this.pendingMessages.shift()!);
      }, 5000); // Try again in 5 seconds
    }
  }
  
  // Emergency stop - completely stops all reconnection attempts and closes window
  emergencyStop(): void {
    this.autoReconnectService.stopAutoReconnect();
    this.windowManager.closeWindow();
    this.connectionService.disconnectFromAI();
    this.pendingMessages = [];
    
    logService.addLog({
      type: 'warning',
      message: 'АВАРИЙНАЯ ОСТАНОВКА: Все подключения к AI остановлены',
      timestamp: Date.now()
    });
    
    // Emit disconnect event
    aiSyncEvents.emit(false, 'Аварийная остановка выполнена');
  }
  
  // Method to clean up resources when service is no longer needed
  cleanup(): void {
    this.autoReconnectService.stopAutoReconnect();
    this.connectionService.disconnectFromAI();
    this.pendingMessages = [];
  }
  
  // Check if auto-reconnect is enabled
  isAutoReconnectEnabled(): boolean {
    return this.autoReconnectService.isAutoReconnectEnabled();
  }
}

export const aiSyncService = new AISyncService();
