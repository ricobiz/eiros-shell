import { useState, useEffect } from 'react';
import { aiSyncService, aiSyncEvents } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useAISync() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConnectedToAI, setIsConnectedToAI] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleToggleAIConnection = async () => {
    if (isConnectedToAI) {
      aiSyncService.disconnectFromAI();
      setIsConnectedToAI(false);
      toast({
        description: t('shellDisconnected'),
      });
    } else {
      const connected = await aiSyncService.connectToAI();
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          description: t('shellConnected'),
        });
      } else {
        toast({
          description: t('connectionErrorDesc'),
          variant: "destructive",
        });
      }
    }
  };
  
  const handleEmergencyStop = () => {
    aiSyncService.emergencyStop();
    setIsConnectedToAI(false);
    toast({
      description: t('emergencyStopDesc'),
      variant: "destructive",
    });
  };
  
  const testAIConnection = async () => {
    if (!isConnectedToAI) {
      toast({
        description: t('connectFirst'),
        variant: "destructive",
      });
      return false;
    }
    
    setIsTestingConnection(true);
    
    try {
      toast({
        description: t('testingSendingMessage'),
      });
      
      // Verify that the window is still open
      if (!aiSyncService.isConnected()) {
        toast({
          description: "ChatGPT window is closed. Please reconnect.",
          variant: "destructive",
        });
        setIsTestingConnection(false);
        return false;
      }
      
      // Send the test message to AI
      const testMessage = "/test#connectivity_test{\"message\": \"This is a test message to verify shell-AI connectivity\"}";
      const messageSent = aiSyncService.sendMessageToAI(testMessage);
      
      if (messageSent) {
        toast({
          description: t('testMessageSent'),
        });
        
        // Also automatically send instructions file to AI
        await sendInstructionsToAI();
        
        // Add a listener for messages for a short period
        const timeoutPromise = new Promise<boolean>(resolve => {
          const timeout = setTimeout(() => {
            resolve(false);
          }, 5000);
          
          const responseHandler = (event: MessageEvent) => {
            if (event.data && event.data.type === 'CHATGPT_RESPONSE') {
              clearTimeout(timeout);
              window.removeEventListener('message', responseHandler);
              resolve(true);
            }
          };
          
          window.addEventListener('message', responseHandler);
        });
        
        // Wait for response or timeout
        const received = await timeoutPromise;
        
        if (received) {
          toast({
            description: "Received response from ChatGPT!",
          });
        } else {
          toast({
            description: "No response received from ChatGPT within timeout period.",
            variant: "default",
          });
        }
        
        return messageSent;
      } else {
        toast({
          description: t('testMessageFailed'),
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        description: t('testConnectionError'),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const sendInstructionsToAI = async () => {
    try {
      const instructions = await aiSyncService.getInstructionsFile();
      if (instructions) {
        const sent = aiSyncService.sendMessageToAI(
          "SHELL INSTRUCTIONS: Below are the instructions for interacting with EirosShell:\n\n" + 
          instructions
        );
        
        if (sent) {
          toast({
            description: t('instructionsSent'),
          });
        }
      }
    } catch (error) {
      console.error("Error sending instructions:", error);
    }
  };

  useEffect(() => {
    setIsConnectedToAI(aiSyncService.isConnected());
    
    return () => {
      aiSyncService.cleanup();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = aiSyncEvents.subscribe((connected, message) => {
      setIsConnectedToAI(connected);
      
      if (message) {
        toast({
          description: message,
          variant: connected ? "default" : "destructive",
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [toast, t]);

  return {
    isConnectedToAI,
    isTestingConnection,
    setIsConnectedToAI,
    handleToggleAIConnection,
    handleEmergencyStop,
    testAIConnection
  };
}
