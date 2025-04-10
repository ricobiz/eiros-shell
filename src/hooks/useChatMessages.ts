
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
      
      // Try to send the message
      aiSyncService.sendMessageToAI(message);
      
      // Add instruction for manual paste - now with clearer instructions
      addMessageToChat('Система', t('messageCopiedToClipboard', { message }));
      
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
