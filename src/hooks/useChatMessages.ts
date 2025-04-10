
import { useState } from 'react';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';
import { commandService } from '@/services/CommandService';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}

export function useChatMessages() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  
  const addMessageToChat = (sender: string, text: string) => {
    setChatHistory(prev => [...prev, {
      sender,
      message: text,
      timestamp: Date.now()
    }]);

    // If message from AI, check if it contains a command
    if (sender === 'ChatGPT') {
      const command = commandService.parseCommand(text);
      if (command) {
        // If it's a command, execute it
        toast({
          title: t('commandDetected'),
          description: `${t('executing')}: ${command.type}`,
        });
        
        commandService.executeCommand(command)
          .then((result) => {
            addMessageToChat('Система', `${t('commandSuccessful')} ${command.type}`);
            // If there's a result, add it to chat
            if (result && typeof result === 'object') {
              addMessageToChat('Система', `${t('result')}: ${JSON.stringify(result, null, 2)}`);
            }
          })
          .catch((error) => {
            addMessageToChat('Система', `${t('commandError')}: ${error.message}`);
          });
      }
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Add message to chat history
      addMessageToChat('Вы', message);
      
      // Send the message to AI directly - no clipboard needed
      const sent = aiSyncService.sendMessageToAI(message);
      
      if (sent) {
        toast({
          title: t('messageSent'),
          description: t('waitingForResponse'),
        });
      } else {
        toast({
          title: t('messageError'),
          description: t('checkConnection'),
          variant: "destructive"
        });
      }
      
      setMessage('');
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  // Function to handle AI response
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
