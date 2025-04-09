
import { useState, useEffect } from 'react';
import { aiSyncService, aiSyncEvents } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';

export function useAISync() {
  const { toast } = useToast();
  const [isConnectedToAI, setIsConnectedToAI] = useState(false);

  const handleToggleAIConnection = async () => {
    if (isConnectedToAI) {
      aiSyncService.disconnectFromAI();
      setIsConnectedToAI(false);
      toast({
        title: "AI Disconnected",
        description: "Shell has been disconnected from AI",
      });
    } else {
      const connected = await aiSyncService.connectToAI();
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          title: "AI Connected",
          description: "Shell has been successfully connected to AI",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to AI. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    aiSyncService.connectToAI().then(connected => {
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          title: "AI Connected",
          description: "Shell has been automatically connected to AI",
        });
      }
    });
    
    return () => {
      aiSyncService.cleanup();
    };
  }, [toast]);

  useEffect(() => {
    const unsubscribe = aiSyncEvents.subscribe((connected, message) => {
      setIsConnectedToAI(connected);
      
      if (message) {
        toast({
          title: connected ? "AI Connected" : "AI Disconnected",
          description: message,
          variant: connected ? "default" : "destructive",
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [toast]);

  return {
    isConnectedToAI,
    setIsConnectedToAI,
    handleToggleAIConnection
  };
}
