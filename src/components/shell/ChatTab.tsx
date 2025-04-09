
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LogViewer from '../LogViewer';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatConnection } from '@/hooks/useChatConnection';
import ChatMessages from './chat/ChatMessages';
import ChatConnectionStatus from './chat/ChatConnectionStatus';
import ChatInput from './chat/ChatInput';
import { useToast } from '@/hooks/use-toast';
import { commandService } from '@/services/CommandService';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  const { toast } = useToast();
  const { 
    message, 
    setMessage, 
    chatHistory,
    sendMessage,
    addMessageToChat,
    clearChatHistory,
    handleAIResponse
  } = useChatMessages();
  
  const {
    isWindowOpen,
    isConnecting,
    connectToChatGPT,
    emergencyStop
  } = useChatConnection(addMessageToChat);
  
  // Only add welcome message if not connected
  useEffect(() => {
    if (!isConnectedToAI && !isWindowOpen && chatHistory.length === 0) {
      // Add a welcome message
      addMessageToChat('Система', 'Нажмите кнопку чтобы связаться с ChatGPT. После успешного подключения вы можете отправить сообщение.');
    }
  }, [isConnectedToAI, isWindowOpen, chatHistory.length, addMessageToChat]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Обработчик вставки для получения ответов от ChatGPT
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Только если текст вставлен и выглядит как ответ от ChatGPT
    // (можно добавить более сложную проверку)
    if (pastedText && pastedText.length > 10) {
      // Проверяем, не является ли это просто повторной вставкой нашего собственного сообщения
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (!lastMessage || lastMessage.sender !== 'Система' || 
          !lastMessage.message.includes(pastedText)) {
        // Обрабатываем как ответ от AI
        e.preventDefault();
        handleAIResponse(pastedText);
      }
    }
  };

  // Добавляем функцию для тестирования связи с ChatGPT
  const handleTestConnection = () => {
    if (!isWindowOpen) {
      toast({
        title: "Ошибка",
        description: "Сначала подключитесь к ChatGPT",
        variant: "destructive"
      });
      return;
    }
    
    // Отправляем тестовое сообщение с запросом на тестовую команду
    const testMessage = "Пожалуйста, ответьте командой '/navigate#test123{\"url\": \"https://example.com\"}' чтобы проверить работу системы команд.";
    setMessage(testMessage);
    sendMessage();
    
    // Добавляем системное сообщение с инструкцией 
    addMessageToChat('Система', 'Тестовое сообщение отправлено. Дождитесь ответа от ChatGPT с командой и вставьте его в поле ввода.');
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="bg-muted/30 p-4 rounded-md flex-1 overflow-auto">
        <ChatMessages chatHistory={chatHistory} />
      </div>
      
      <div className="space-y-3">
        <ChatInput 
          message={message}
          disabled={!isWindowOpen}
          onChange={(e) => setMessage(e.target.value)}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          onTestConnection={handleTestConnection}
        />
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClearLogs}>
            Очистить логи
          </Button>
          
          <ChatConnectionStatus
            isWindowOpen={isWindowOpen}
            isConnecting={isConnecting}
            onConnectToChatGPT={connectToChatGPT}
            onEmergencyStop={emergencyStop}
          />
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">Логи:</p>
        <div className="bg-muted/30 p-2 rounded-md max-h-[100px] overflow-auto">
          <LogViewer maxHeight="80px" maxLogs={10} />
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
