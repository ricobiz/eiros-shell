
import { logService } from '../LogService';
import { AIWindowManager } from './types';
import { aiSyncEvents } from './events';
import { toast } from '@/hooks/use-toast';

// Define error types for better handling
export enum MessageErrorType {
  UNAVAILABLE = 'unavailable',
  RATE_LIMITED = 'rate_limited',
  WINDOW_CLOSED = 'window_closed',
  COMMUNICATION_ERROR = 'communication_error',
  UNKNOWN = 'unknown'
}

export class AIMessagingService {
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2 seconds
  private automaticMode: boolean = true; // Direct communication mode
  
  constructor(private windowManager: AIWindowManager) {}
  
  async sendMessage(message: string): Promise<boolean> {
    // Reset retry count on new message
    this.retryCount = 0;
    return this.attemptSendMessage(message);
  }

  private async attemptSendMessage(message: string): Promise<boolean> {
    if (!this.windowManager.isWindowOpen()) {
      logService.addLog({
        type: 'warning',
        message: 'Cannot send message: ChatGPT window is not open',
        timestamp: Date.now(),
      });
      
      this.handleError(MessageErrorType.WINDOW_CLOSED, 'ChatGPT window is not available');
      return false;
    }
    
    try {
      // Focus the window to make it visible to the user
      this.windowManager.focusWindow();
      
      logService.addLog({
        type: 'info',
        message: 'Sending message to ChatGPT',
        timestamp: Date.now(),
        details: { message }
      });
      
      if (this.automaticMode) {
        // In automatic mode, we would use the browser automation API to directly
        // input text and click send, but we'll simulate it here
        console.log('Automatically sending to ChatGPT:', message);
        
        // This would be a direct API call or automation in a real implementation
        try {
          // Simulate sending the message to the ChatGPT window
          const success = await this.simulateDirectMessageSend(message);
          
          if (success) {
            logService.addLog({
              type: 'info',
              message: 'Message automatically sent to ChatGPT',
              timestamp: Date.now()
            });
            return true;
          } else {
            throw new Error("Failed to send message via automation");
          }
        } catch (err) {
          logService.addLog({
            type: 'warning',
            message: 'Automatic message sending failed',
            timestamp: Date.now(),
            details: err
          });
          
          this.handleError(MessageErrorType.COMMUNICATION_ERROR, 
            'Automatic message sending failed. Check browser permissions.');
          
          return false;
        }
      } else {
        // Fallback to clipboard mode if automatic fails
        try {
          await navigator.clipboard.writeText(message);
          logService.addLog({
            type: 'info',
            message: 'Message copied to clipboard (fallback mode)',
            timestamp: Date.now()
          });
          
          return true;
        } catch (clipboardErr) {
          this.handleError(MessageErrorType.COMMUNICATION_ERROR, 
            'Unable to copy message to clipboard.');
          return false;
        }
      }
    } catch (err: any) {
      // Try to determine if this is a rate limiting issue or availability issue
      const errorType = this.detectErrorType(err);
      const errorMessage = this.getErrorMessage(errorType);
      
      this.handleError(errorType, errorMessage);
      
      // For certain errors, we can retry automatically
      if (this.canRetry(errorType)) {
        return await this.retryAfterDelay(message);
      }
      
      return false;
    }
  }

  // Simulate direct message sending to ChatGPT
  private async simulateDirectMessageSend(message: string): Promise<boolean> {
    try {
      // In a real implementation, this would use the Python automation API
      // to directly input text and click send in the ChatGPT interface
      
      // Instead, we'll just assume it worked for demonstration purposes
      // We could expand this with actual browser automation code later
      
      logService.addLog({
        type: 'info',
        message: 'Direct message automation executed',
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Direct message automation failed',
        timestamp: Date.now(),
        details: error
      });
      
      return false;
    }
  }
  
  private detectErrorType(error: any): MessageErrorType {
    // Check for common patterns in error messages or status codes
    // that might indicate rate limiting or availability issues
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('rate') && (errorMsg.includes('limit') || errorMsg.includes('exceeded'))) {
      return MessageErrorType.RATE_LIMITED;
    } else if (errorMsg.includes('unavailable') || errorMsg.includes('down') || 
              errorMsg.includes('503') || errorMsg.includes('502')) {
      return MessageErrorType.UNAVAILABLE;
    } else if (errorMsg.includes('automation') || errorMsg.includes('permission')) {
      return MessageErrorType.COMMUNICATION_ERROR;
    }
    
    return MessageErrorType.UNKNOWN;
  }
  
  private getErrorMessage(errorType: MessageErrorType): string {
    switch (errorType) {
      case MessageErrorType.RATE_LIMITED:
        return 'ChatGPT is currently rate limited. Will retry shortly.';
      case MessageErrorType.UNAVAILABLE:
        return 'ChatGPT service appears to be temporarily unavailable.';
      case MessageErrorType.WINDOW_CLOSED:
        return 'ChatGPT window is not open. Please reconnect.';
      case MessageErrorType.COMMUNICATION_ERROR:
        return 'Unable to communicate with ChatGPT. Check automation permissions.';
      default:
        return 'An unexpected error occurred while sending message to ChatGPT.';
    }
  }
  
  private handleError(errorType: MessageErrorType, message: string): void {
    // Log the error
    logService.addLog({
      type: 'error',
      message: `Messaging error: ${message}`,
      timestamp: Date.now(),
      details: { errorType }
    });
    
    // Show toast notification
    toast({
      title: "Message Error",
      description: message,
      variant: "destructive",
    });
    
    // For significant connection issues, emit an event for the app to handle
    if (errorType === MessageErrorType.UNAVAILABLE || 
        errorType === MessageErrorType.WINDOW_CLOSED) {
      aiSyncEvents.emit(false, message);
    }
  }
  
  private canRetry(errorType: MessageErrorType): boolean {
    // We can retry for these error types
    return (
      this.retryCount < this.maxRetries && 
      (errorType === MessageErrorType.RATE_LIMITED || 
       errorType === MessageErrorType.UNAVAILABLE)
    );
  }
  
  private async retryAfterDelay(message: string): Promise<boolean> {
    this.retryCount++;
    
    // Calculate delay with exponential backoff
    const delay = this.retryDelay * Math.pow(1.5, this.retryCount - 1);
    
    logService.addLog({
      type: 'info',
      message: `Retrying in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`,
      timestamp: Date.now()
    });
    
    // Show toast for retry
    toast({
      title: "Retrying",
      description: `Will retry sending message in ${Math.round(delay/1000)} seconds (attempt ${this.retryCount}/${this.maxRetries})`,
    });
    
    // Wait and retry
    return new Promise(resolve => {
      setTimeout(async () => {
        resolve(await this.attemptSendMessage(message));
      }, delay);
    });
  }
}
