
import { useState, useEffect } from 'react';
import { aiSyncService, aiSyncEvents } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useAISync() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConnectedToAI, setIsConnectedToAI] = useState(false);

  const handleToggleAIConnection = async () => {
    if (isConnectedToAI) {
      aiSyncService.disconnectFromAI();
      setIsConnectedToAI(false);
      toast({
        title: t('aiDisconnected'),
        description: t('shellDisconnected'),
      });
    } else {
      const connected = await aiSyncService.connectToAI();
      setIsConnectedToAI(connected);
      
      if (connected) {
        toast({
          title: t('aiConnectedToast'),
          description: t('shellConnected'),
        });
      } else {
        toast({
          title: t('connectionError'),
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
      title: t('emergencyStopTitle'),
      description: t('emergencyStopDesc'),
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
          title: connected ? t('aiConnectedToast') : t('aiDisconnected'),
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
    setIsConnectedToAI,
    handleToggleAIConnection,
    handleEmergencyStop
  };
}
