
import { useState, useEffect } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './useChatMessages';

export function useChatConnection(addMessageToChat: (sender: string, text: string) => void) {
  const { toast } = useToast();
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check connection status on component mount and set up periodic checks
  useEffect(() => {
    const checkConnectionStatus = () => {
      const isConnected = aiSyncService.isConnected();
      setIsWindowOpen(isConnected);
    };
    
    // Check initially
    checkConnectionStatus();
    
    // Set up interval to check connection status - but only every 5 seconds
    const intervalId = setInterval(checkConnectionStatus, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
