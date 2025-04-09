
import React from 'react';
import { ChatMessage } from '@/hooks/useChatMessages';
import { commandService } from '@/services/CommandService';

interface ChatMessagesProps {
  chatHistory: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatHistory }) => {
  // Проверка команды в сообщении для специального отображения
  const isCommand = (message: string) => {
    return commandService.parseCommand(message) !== null;
  };

  if (chatHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Нажмите "Подключить ChatGPT" чтобы начать</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chatHistory.map((chat, index) => (
        <div 
          key={index} 
          className={`flex ${chat.sender === 'Вы' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] p-3 rounded-lg ${
              chat.sender === 'Вы' 
                ? 'bg-primary text-primary-foreground' 
                : chat.sender === 'Система'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                  : chat.sender === 'ChatGPT' && isCommand(chat.message)
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-2 border-green-500'
                    : 'bg-muted text-muted-foreground'
            }`}
          >
            <p className="text-xs font-medium mb-1">{chat.sender}</p>
            <p className="text-sm">{chat.message}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(chat.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
