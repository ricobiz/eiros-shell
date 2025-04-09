
import { AIConnectionService } from './connectionService';

export class AutoReconnectService {
  private windowCheckInterval: number | null = null;
  private readonly CHECK_INTERVAL = 5000; // 5 seconds
  
  constructor(private connectionService: AIConnectionService) {}
  
  setupAutoReconnect() {
    // Check connection status periodically and reconnect if needed
    this.windowCheckInterval = window.setInterval(() => {
      if (!this.connectionService.isConnected()) {
        this.connectionService.connectToAI();
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
