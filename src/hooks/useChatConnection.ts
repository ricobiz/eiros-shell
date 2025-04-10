
import { useState, useEffect } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './useChatMessages';
import { logService } from '@/services/LogService';
import { windowManager } from '@/services/ai-sync/windowManager';

export function useChatConnection(addMessageToChat: (sender: string, text: string) => void) {
  console.log('useChatConnection hook initializing');
  const { toast } = useToast();
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check connection status on component mount and set up periodic checks
  useEffect(() => {
    console.log('Setting up connection status check');
    
    const checkConnectionStatus = () => {
      const isConnected = aiSyncService.isConnected();
      console.log('Checking connection status:', isConnected ? 'connected' : 'disconnected');
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
    console.log('Setting up message listener from ChatGPT window');
    
    const handleMessage = (event: MessageEvent) => {
      // Check if this is a message from ChatGPT
      if (event.data && typeof event.data === 'object' && 
          (event.data.type === 'CHATGPT_RESPONSE' || event.data.type === 'EIROS_RESPONSE')) {
        
        console.log('Received message from ChatGPT window in useChatConnection:', event.data);
        
        // Add message to chat
        const messageContent = event.data.message || event.data.content || 'Empty response received';
        
        addMessageToChat(
          'ChatGPT', 
          messageContent
        );
        
        // Log the received message
        logService.addLog({
          type: 'success',
          message: 'Received response from ChatGPT',
          timestamp: Date.now(),
          details: { messageLength: (messageContent).length }
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [addMessageToChat]);

  const connectToChatGPT = async () => {
    console.log('ConnectToChatGPT called');
    if (isConnecting) {
      console.log('Already connecting, ignoring request');
      return;
    }
    
    setIsConnecting(true);
    console.log('Starting connection process');
    
    try {
      const success = await aiSyncService.connectToAI();
      console.log('Connection attempt result:', success ? 'success' : 'failed');
      setIsWindowOpen(success);
      
      if (success) {
        toast({
          title: "ChatGPT Connected",
          description: "Automatic communication established with ChatGPT",
        });
        
        addMessageToChat('Система', 'Connection established! You can now send messages directly to ChatGPT.');
        
        // Send a test message to verify bidirectional communication
        const initialTestMessage = {
          type: 'EIROS_INIT',
          message: 'Initializing communication channel'
        };
        
        const chatWindow = windowManager.getWindow();
        if (chatWindow) {
          try {
            chatWindow.postMessage(initialTestMessage, '*');
            
            logService.addLog({
              type: 'info',
              message: 'Sent initialization message to ChatGPT window',
              timestamp: Date.now()
            });
          } catch (error) {
            console.error('Failed to send initialization message:', error);
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
    } catch (error) {
      console.error('Error during connection:', error);
      
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      addMessageToChat('Система', `Connection error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsConnecting(false);
      console.log('Connection process completed');
    }
  };
  
  const emergencyStop = () => {
    console.log('Emergency stop requested');
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
