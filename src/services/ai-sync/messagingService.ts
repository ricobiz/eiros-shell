
import { logService } from '../LogService';
import { AIWindowManager } from './types';

export class AIMessagingService {
  constructor(private windowManager: AIWindowManager) {}
  
  async sendMessage(message: string): Promise<boolean> {
    if (!this.windowManager.isWindowOpen()) {
      return false;
    }
    
    // Focus the window to make it visible to the user
    this.windowManager.focusWindow();
    
    logService.addLog({
      type: 'info',
      message: 'Message ready to send to ChatGPT',
      timestamp: Date.now(),
      details: { message }
    });
    
    // In the browser approach, the message is shown to the user to paste manually
    console.log('Ready to send to ChatGPT:', message);
    
    // Try to copy to clipboard
    try {
      await navigator.clipboard.writeText(message);
      logService.addLog({
        type: 'info',
        message: 'Message copied to clipboard for easy pasting',
        timestamp: Date.now()
      });
      return true;
    } catch (err) {
      logService.addLog({
        type: 'warning',
        message: 'Could not copy message to clipboard',
        timestamp: Date.now(),
        details: err
      });
      return false;
    }
  }
}
