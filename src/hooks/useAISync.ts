
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
        title: "AI отключен",
        description: "Shell отключен от AI",
      });
    } else {
      const connected = await aiSyncService.connectToAI();
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          title: "AI подключен",
          description: "Shell успешно подключен к AI",
        });
      } else {
        toast({
          title: "Ошибка подключения",
          description: "Не удалось подключиться к AI. Попробуйте снова.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleEmergencyStop = () => {
    aiSyncService.emergencyStop();
    setIsConnectedToAI(false);
    toast({
      title: "Аварийная остановка",
      description: "Все подключения к AI остановлены",
      variant: "destructive",
    });
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
          title: connected ? "AI подключен" : "AI отключен",
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
    handleToggleAIConnection,
    handleEmergencyStop
  };
}
