
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
  
  // Форматирование сообщения для отображения команд
  const formatMessage = (message: string) => {
    if (isCommand(message)) {
      const command = commandService.parseCommand(message);
      if (command) {
        return (
          <>
            <div className="font-mono bg-black/10 p-2 rounded mb-2">
              <span className="font-bold text-green-600">/{command.type}</span>
              <span className="text-blue-600">#{command.id}</span>
              <pre className="text-xs mt-1 overflow-x-auto">
                {JSON.stringify(command.params, null, 2)}
              </pre>
            </div>
            <p className="text-sm opacity-80">Оригинал: {message}</p>
          </>
        );
      }
    }
    return <p className="text-sm">{message}</p>;
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
            <div>{formatMessage(chat.message)}</div>
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
