
import { logService } from '../LogService';
import { AIWindowManager } from './types';
import { aiSyncEvents } from './events';
import { toast } from '@/hooks/use-toast';

// Define error types for better handling
export enum MessageErrorType {
  UNAVAILABLE = 'unavailable',
  RATE_LIMITED = 'rate_limited',
  WINDOW_CLOSED = 'window_closed',
  CLIPBOARD_ERROR = 'clipboard_error',
  UNKNOWN = 'unknown'
}

export class AIMessagingService {
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2 seconds
  
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
        message: 'Message ready to send to ChatGPT',
        timestamp: Date.now(),
        details: { message }
      });
      
      // In the browser approach, the message is copied to clipboard for manual pasting
      console.log('Ready to send to ChatGPT:', message);
      
      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(message);
        logService.addLog({
          type: 'info',
          message: 'Message copied to clipboard for pasting into ChatGPT',
          timestamp: Date.now()
        });
        
        // Show toast with clearer instructions
        toast({
          title: "Message Ready",
          description: "Message copied to clipboard. Please paste (Ctrl+V/Cmd+V) into ChatGPT window.",
        });
        
        return true;
      } catch (clipboardErr) {
        logService.addLog({
          type: 'warning',
          message: 'Could not copy message to clipboard',
          timestamp: Date.now(),
          details: clipboardErr
        });
        
        this.handleError(MessageErrorType.CLIPBOARD_ERROR, 
          'Unable to copy message to clipboard. Please copy the message manually from the chat history.');
        
        return false;
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
  
  private detectErrorType(error: any): MessageErrorType {
    // Check for common patterns in error messages or status codes
    // that might indicate rate limiting or availability issues
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('rate') && (errorMsg.includes('limit') || errorMsg.includes('exceeded'))) {
      return MessageErrorType.RATE_LIMITED;
    } else if (errorMsg.includes('unavailable') || errorMsg.includes('down') || 
              errorMsg.includes('503') || errorMsg.includes('502')) {
      return MessageErrorType.UNAVAILABLE;
    } else if (errorMsg.includes('clipboard')) {
      return MessageErrorType.CLIPBOARD_ERROR;
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
      case MessageErrorType.CLIPBOARD_ERROR:
        return 'Unable to copy message to clipboard. Please check permissions.';
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
