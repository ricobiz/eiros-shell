
import { useState } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';

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

  return {
    message,
    setMessage,
    chatHistory,
    sendMessage,
    addMessageToChat,
    clearChatHistory
  };
}
