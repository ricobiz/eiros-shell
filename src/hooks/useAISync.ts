
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
      
      // Send the test message to AI
      const testMessage = "/test#connectivity_test{\"message\": \"This is a test message to verify shell-AI connectivity\"}";
      const messageSent = aiSyncService.sendMessageToAI(testMessage);
      
      if (messageSent) {
        toast({
          description: t('testMessageSent'),
        });
        
        // Send instructions file to AI
        await sendInstructionsToAI();
        
        return true;
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
    // Instead of auto-connecting, we'll just check the initial connection state
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
