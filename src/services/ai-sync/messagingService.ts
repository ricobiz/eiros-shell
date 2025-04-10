
import { logService } from '../LogService';

/**
 * Service for handling message sending to AI
 */
export class MessagingService {
  sendMessageToAI(message: string, connected: boolean): boolean {
    if (!connected) {
      console.error('Cannot send message: not connected to AI');
      return false;
    }
    
    try {
      // Message sending logic would go here
      console.log('Sending message to AI:', message);
      // In a real implementation, this would connect to the backend
      
      logService.addLog({
        type: 'info',
        message: 'Message sent to AI',
        timestamp: Date.now(),
        details: { message: message.substring(0, 100) + (message.length > 100 ? '...' : '') }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Failed to send message to AI',
        timestamp: Date.now(),
        details: error
      });
      
      return false;
    }
  }

  processAIResponse(response: string, connected: boolean): void {
    if (!connected) {
      console.error('Cannot process AI response: not connected');
      return;
    }
    
    try {
      // Here we would parse the response for commands
      console.log('Processing AI response:', response);
      
      logService.addLog({
        type: 'info',
        message: 'Processing AI response',
        timestamp: Date.now(),
        details: { response: response.substring(0, 100) + (response.length > 100 ? '...' : '') }
      });
      
      // In a real implementation, this would extract commands and execute them
    } catch (error) {
      console.error('Error processing AI response:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Error processing AI response',
        timestamp: Date.now(),
        details: error
      });
    }
  }
}

export const messagingService = new MessagingService();
