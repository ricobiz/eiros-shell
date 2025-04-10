
import { useState, useEffect } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './useChatMessages';
import { logService } from '@/services/LogService';
import { windowManager } from '@/services/ai-sync/windowManager';

export function useChatConnection(addMessageToChat: (sender: string, text: string) => void) {
  const { toast } = useToast();
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check connection status on component mount and set up periodic checks
  useEffect(() => {
    const checkConnectionStatus = () => {
      const isConnected = aiSyncService.isConnected();
      setIsWindowOpen(isConnected);
      
      // Log connection check results for debugging
      if (isConnected !== isWindowOpen) {
        logService.addLog({
          type: isConnected ? 'success' : 'info',
          message: isConnected 
            ? 'Connection status: Window is open' 
            : 'Connection status: Window is closed',
          timestamp: Date.now()
        });
      }
    };
    
    // Check initially
    checkConnectionStatus();
    
    // Set up interval to check connection status - but only every 5 seconds
    const intervalId = setInterval(checkConnectionStatus, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isWindowOpen]);

  // Listen for messages from ChatGPT window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if this is a message from ChatGPT
      if (event.data && typeof event.data === 'object' && 
          (event.data.type === 'CHATGPT_RESPONSE' || event.data.type === 'EIROS_RESPONSE')) {
        
        console.log('Received message from ChatGPT window in useChatConnection:', event.data);
        
        // Add message to chat
        addMessageToChat(
          'ChatGPT', 
          event.data.message || event.data.content || 'Empty response received'
        );
        
        // Log the received message
        logService.addLog({
          type: 'success',
          message: 'Received response from ChatGPT',
          timestamp: Date.now(),
          details: { messageLength: (event.data.message || '').length }
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [addMessageToChat]);

  const connectToChatGPT = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const success = await aiSyncService.connectToAI();
      setIsWindowOpen(success);
      
      if (success) {
        toast({
          title: "ChatGPT Connected",
          description: "Automatic communication established with ChatGPT",
        });
        
        addMessageToChat('Система', 'Connection established! You can now send messages directly to ChatGPT.');
        
        // Inject script into ChatGPT window to enable communication back
        // This is a simplified example, in practice you would set up a more robust messaging system
        const chatWindow = windowManager.getWindow();
        if (chatWindow) {
          try {
            chatWindow.postMessage({ 
              type: 'EIROS_INIT', 
              message: 'Setting up communication channel' 
            }, '*');
            
            // Log that we're initializing
            logService.addLog({
              type: 'info',
              message: 'Initialized communication channel with ChatGPT window',
              timestamp: Date.now()
            });
          } catch (error) {
            console.error('Failed to inject communication script:', error);
            logService.addLog({
              type: 'error',
              message: 'Failed to initialize communication channel',
              timestamp: Date.now(),
              details: error
            });
          }
        }
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to connect to ChatGPT. Please check browser permissions.",
          variant: "destructive"
        });
        
        addMessageToChat('Система', 'Connection error. Please try again or check browser automation permissions.');
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  const emergencyStop = () => {
    aiSyncService.emergencyStop();
    setIsWindowOpen(false);
    
    addMessageToChat('Система', 'Emergency stop executed. All connections closed.');
    
    toast({
      title: "Emergency Stop",
      description: "All connections to ChatGPT stopped",
      variant: "destructive"
    });
  };

  return {
    isWindowOpen,
    isConnecting,
    connectToChatGPT,
    emergencyStop
  };
}
