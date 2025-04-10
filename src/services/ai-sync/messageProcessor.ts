
import { logService } from '../LogService';
import { commandService } from '../CommandService';

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
      // Log the response reception
      console.log('Processing AI response:', response);
      
      logService.addLog({
        type: 'info',
        message: 'Processing AI response',
        timestamp: Date.now(),
        details: { response: response.substring(0, 100) + (response.length > 100 ? '...' : '') }
      });
      
      // Check if this is a command by parsing it
      const command = commandService.parseCommand(response);
      
      if (command) {
        logService.addLog({
          type: 'success',
          message: `Command detected in AI response: ${command.type}#${command.id}`,
          timestamp: Date.now()
        });
        
        // Execute the command
        commandService.executeCommand(command)
          .then(result => {
            logService.addLog({
              type: 'success',
              message: `Command executed successfully: ${command.type}#${command.id}`,
              timestamp: Date.now(),
              details: result
            });
          })
          .catch(error => {
            logService.addLog({
              type: 'error',
              message: `Command execution failed: ${command.type}#${command.id}`,
              timestamp: Date.now(),
              details: error instanceof Error ? error.message : String(error)
            });
          });
      } else {
        // If not a command, just log as regular message
        logService.addLog({
          type: 'info',
          message: 'Received non-command message from AI',
          timestamp: Date.now(),
          details: { response: response.substring(0, 50) }
        });
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      
      logService.addLog({
        type: 'error',
        message: 'Error processing AI response',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export const messageProcessor = new MessageProcessor();
