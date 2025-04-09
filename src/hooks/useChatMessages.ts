
import { useState } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { commandService } from '@/services/CommandService';

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

export function useChatMessages() {
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  
  const addMessageToChat = (sender: string, text: string) => {
    setChatHistory(prev => [...prev, {
      sender,
      message: text,
      timestamp: Date.now()
    }]);

    // Если сообщение от AI, проверяем, не содержит ли оно команду
    if (sender === 'ChatGPT') {
      const command = commandService.parseCommand(text);
      if (command) {
        // Если это команда, выполняем её
        toast({
          title: "Команда обнаружена",
          description: `Выполняю команду: ${command.type}`,
        });
        
        commandService.executeCommand(command)
          .then((result) => {
            addMessageToChat('Система', `Команда ${command.type} успешно выполнена`);
            // Если есть результат, добавляем его в чат
            if (result && typeof result === 'object') {
              addMessageToChat('Система', `Результат: ${JSON.stringify(result, null, 2)}`);
            }
          })
          .catch((error) => {
            addMessageToChat('Система', `Ошибка при выполнении команды: ${error.message}`);
          });
      }
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Add message to chat history
      addMessageToChat('Вы', message);
      
      // Try to send the message
      aiSyncService.sendMessageToAI(message);
      
      // Add instruction for manual paste
      addMessageToChat('Система', 'Сообщение скопировано в буфер обмена. Нажмите Ctrl+V (или Cmd+V) в окне ChatGPT чтобы вставить текст: "' + message + '"');
      
      setMessage('');
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  // Функция для обработки сообщения от AI
  const handleAIResponse = (text: string) => {
    addMessageToChat('ChatGPT', text);
  };

  return {
    message,
    setMessage,
    chatHistory,
    sendMessage,
    addMessageToChat,
    clearChatHistory,
    handleAIResponse
  };
}
