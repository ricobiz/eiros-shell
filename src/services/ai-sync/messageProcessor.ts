
import { logService } from '../LogService';

/**
 * Service for handling AI response processing
 */
export class MessageProcessor {
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

export const messageProcessor = new MessageProcessor();
