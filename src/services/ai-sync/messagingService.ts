
import { logService } from '../LogService';
import { messageProcessor } from './messageProcessor';
import { windowManager } from './windowManager';

/**
 * Service for handling message sending to AI
 */
export class MessagingService {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  
  sendMessageToAI(message: string, connected: boolean): boolean {
    if (!connected) {
      console.error('Cannot send message: not connected to AI');
      return false;
    }
    
    // Verify window is still open
    if (!windowManager.isWindowOpen()) {
      console.error('Window is no longer open');
      
      logService.addLog({
        type: 'error',
        message: 'Failed to send message: ChatGPT window is closed',
        timestamp: Date.now()
      });
      
      return false;
    }
    
    try {
      // Get window reference
      const chatWindow = windowManager.getWindow();
      
      if (!chatWindow) {
        throw new Error('Cannot get window reference');
      }
      
      console.log('Sending message to AI:', message);
      
      // In a real implementation with browser automation, we would:
      // 1. Focus the chat window
      chatWindow.focus();
      
      // 2. Attempt to access the chat input by posting a message to the window
      chatWindow.postMessage({
        type: 'EIROS_SHELL_MESSAGE',
        message: message
      }, '*');
      
      // 3. Log the attempt
      logService.addLog({
        type: 'info',
        message: 'Message sent to ChatGPT window',
        timestamp: Date.now(),
        details: { 
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          windowActive: !chatWindow.closed 
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Failed to send message to ChatGPT',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : String(error)
      });
      
      return false;
    }
  }

  processAIResponse(response: string, connected: boolean): void {
    messageProcessor.processAIResponse(response, connected);
  }
}

export const messagingService = new MessagingService();
