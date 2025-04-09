
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
  
  constructor() {
    this.windowManager = new ChatGPTWindowManager();
    this.connectionService = new AIConnectionService(this.windowManager);
    this.messagingService = new AIMessagingService(this.windowManager);
    this.autoReconnectService = new AutoReconnectService(this.connectionService);
    
    // Setup automatic reconnection on initialization
    this.autoReconnectService.setupAutoReconnect();
  }
  
  isConnected(): boolean {
    return this.connectionService.isConnected();
  }
  
  async connectToAI(): Promise<boolean> {
    return this.connectionService.connectToAI();
  }
  
  disconnectFromAI(): void {
    this.connectionService.disconnectFromAI();
  }
  
  async sendMessageToAI(message: string): Promise<void> {
    if (!this.connectionService.isConnected()) {
      // Try to reconnect first
      const connected = await this.connectionService.connectToAI();
      if (connected) {
        logService.addLog({
          type: 'info',
          message: 'Reconnected to AI, now can send message',
          timestamp: Date.now()
        });
        
        this.sendMessageAfterConnection(message);
      } else {
        logService.addLog({
          type: 'warning',
          message: 'Cannot send message: Failed to reconnect to AI',
          timestamp: Date.now()
        });
      }
      return;
    }
    
    this.sendMessageAfterConnection(message);
  }
  
  private async sendMessageAfterConnection(message: string): Promise<void> {
    await this.messagingService.sendMessage(message);
  }
  
  // Method to clean up resources when service is no longer needed
  cleanup(): void {
    this.autoReconnectService.stopAutoReconnect();
    this.connectionService.disconnectFromAI();
  }
}

export const aiSyncService = new AISyncService();
