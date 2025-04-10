
import { useState, useEffect } from 'react';
import { aiSyncService, aiSyncEvents } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useAISync() {
  console.log('Initializing useAISync hook');
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConnectedToAI, setIsConnectedToAI] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleToggleAIConnection = async () => {
    console.log('Toggle AI connection called, current state:', isConnectedToAI);
    if (isConnectedToAI) {
      aiSyncService.disconnectFromAI();
      setIsConnectedToAI(false);
      toast({
        description: t('shellDisconnected'),
      });
    } else {
      console.log('Attempting to connect to AI...');
      const connected = await aiSyncService.connectToAI();
      console.log('Connection result:', connected);
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
    console.log('Emergency stop called');
    aiSyncService.emergencyStop();
    setIsConnectedToAI(false);
    toast({
      description: t('emergencyStopDesc'),
      variant: "destructive",
    });
  };
  
  const testAIConnection = async () => {
    console.log('Testing AI connection');
    if (!isConnectedToAI) {
      console.log('Not connected, cannot test');
      toast({
        description: t('connectFirst'),
        variant: "destructive",
      });
      return false;
    }
    
    setIsTestingConnection(true);
    console.log('Setting testing flag to true');
    
    try {
      toast({
        description: t('testingSendingMessage'),
      });
      
      // Verify that the window is still open
      if (!aiSyncService.isConnected()) {
        console.log('Window is closed, cannot test');
        toast({
          description: "ChatGPT window is closed. Please reconnect.",
          variant: "destructive",
        });
        setIsTestingConnection(false);
        return false;
      }
      
      // Send the test message to AI
      console.log('Sending test message to AI');
      const testMessage = "/test#connectivity_test{\"message\": \"This is a test message to verify shell-AI connectivity\"}";
      const messageSent = aiSyncService.sendMessageToAI(testMessage);
      console.log('Test message sent result:', messageSent);
      
      if (messageSent) {
        toast({
          description: t('testMessageSent'),
        });
        
        // Also automatically send instructions file to AI
        await sendInstructionsToAI();
        
        // Add a listener for messages for a short period
        console.log('Setting up response listener with timeout');
        const timeoutPromise = new Promise<boolean>(resolve => {
          const timeout = setTimeout(() => {
            console.log('Response timeout reached');
            resolve(false);
          }, 5000);
          
          const responseHandler = (event: MessageEvent) => {
            if (event.data && event.data.type === 'CHATGPT_RESPONSE') {
              console.log('Received response during testing');
              clearTimeout(timeout);
              window.removeEventListener('message', responseHandler);
              resolve(true);
            }
          };
          
          window.addEventListener('message', responseHandler);
        });
        
        // Wait for response or timeout
        const received = await timeoutPromise;
        console.log('Response received?', received);
        
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
      console.log('Setting testing flag to false');
    }
  };
  
  const sendInstructionsToAI = async () => {
    console.log('Sending instructions to AI');
    try {
      const instructions = await aiSyncService.getInstructionsFile();
      console.log('Instructions loaded:', instructions ? 'success' : 'failed');
      
      if (instructions) {
        const sent = aiSyncService.sendMessageToAI(
          "SHELL INSTRUCTIONS: Below are the instructions for interacting with EirosShell:\n\n" + 
          instructions
        );
        console.log('Instructions sent:', sent);
        
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
    const isConnected = aiSyncService.isConnected();
    console.log('Initial connection check in useAISync:', isConnected);
    setIsConnectedToAI(isConnected);
    
    return () => {
      aiSyncService.cleanup();
      console.log('Cleaning up AI sync service');
    };
  }, []);

  useEffect(() => {
    console.log('Setting up aiSyncEvents subscription');
    const unsubscribe = aiSyncEvents.subscribe((connected, message) => {
      console.log('AI sync event received:', connected, message);
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
      console.log('Unsubscribed from aiSyncEvents');
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
