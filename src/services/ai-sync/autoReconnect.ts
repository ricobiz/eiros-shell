
import { AIConnectionService } from './connectionService';

export class AutoReconnectService {
  private windowCheckInterval: number | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds instead of 5
  private isReconnecting = false;
  
  constructor(private connectionService: AIConnectionService) {}
  
  setupAutoReconnect() {
    // Only set up if not already set up
    if (this.windowCheckInterval !== null) {
      return;
    }
    
    // Check connection status periodically and reconnect if needed
    this.windowCheckInterval = window.setInterval(() => {
      // Prevent multiple reconnection attempts running simultaneously
      if (this.isReconnecting) return;
      
      if (!this.connectionService.isConnected()) {
        this.isReconnecting = true;
        this.connectionService.connectToAI().finally(() => {
          this.isReconnecting = false;
        });
      }
    }, this.CHECK_INTERVAL);
  }
  
  stopAutoReconnect() {
    if (this.windowCheckInterval !== null) {
      window.clearInterval(this.windowCheckInterval);
      this.windowCheckInterval = null;
    }
  }
}
