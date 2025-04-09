
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
          title: "ChatGPT подключен",
          description: "Теперь вы можете отправлять сообщения в ChatGPT",
        });
        
        addMessageToChat('Система', 'Подключение установлено! Введите сообщение ниже и нажмите отправить.');
      } else {
        toast({
          title: "Ошибка подключения",
          description: "Не удалось подключиться к ChatGPT. Проверьте, не блокирует ли браузер всплывающие окна.",
          variant: "destructive"
        });
        
        addMessageToChat('Система', 'Ошибка подключения. Пожалуйста, попробуйте снова.');
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  const emergencyStop = () => {
    aiSyncService.emergencyStop();
    setIsWindowOpen(false);
    
    addMessageToChat('Система', 'Аварийная остановка выполнена. Все подключения закрыты.');
    
    toast({
      title: "Аварийная остановка",
      description: "Все подключения к ChatGPT остановлены",
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
