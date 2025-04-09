
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ExternalLink, AlertOctagon } from 'lucide-react';
import LogViewer from '../LogViewer';
import { aiSyncService } from '@/services/ai-sync';
import { useToast } from '@/hooks/use-toast';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: string; message: string; timestamp: number}[]>([]);
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
    
    // Only auto-connect if explicitly told to
    if (!isConnectedToAI && !isWindowOpen) {
      // Add a welcome message
      addMessageToChat('Система', 'Нажмите кнопку чтобы связаться с ChatGPT. После успешного подключения вы можете отправить сообщение.');
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isConnectedToAI]);
  
  // Function to manually connect to ChatGPT
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
  
  // Function to send a message
  const sendMessage = () => {
    if (message.trim()) {
      // Add message to chat history
      addMessageToChat('Вы', message);
      
      // Try to send the message (service will auto-reconnect if needed)
      aiSyncService.sendMessageToAI(message);
      
      // Add instruction for manual paste
      addMessageToChat('Система', 'Сообщение скопировано в буфер обмена. Нажмите Ctrl+V (или Cmd+V) в окне ChatGPT чтобы вставить текст: "' + message + '"');
      
      setMessage('');
    }
  };
  
  const addMessageToChat = (sender: string, text: string) => {
    setChatHistory(prev => [...prev, {
      sender,
      message: text,
      timestamp: Date.now()
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="bg-muted/30 p-4 rounded-md flex-1 overflow-auto">
        {chatHistory.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Нажмите "Подключить ChatGPT" чтобы начать</p>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Введите сообщение для ChatGPT..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={!isWindowOpen}
          />
          <Button 
            variant="default" 
            size="icon"
            disabled={!message.trim() || !isWindowOpen}
            onClick={sendMessage}
          >
            <Send size={16} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClearLogs}>
            Очистить логи
          </Button>
          
          {isWindowOpen ? (
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                ChatGPT подключен
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  if (aiSyncService.isConnected()) {
                    window.open('https://chat.openai.com/', 'ChatGPT', 'width=800,height=600');
                  }
                }}
              >
                <ExternalLink size={14} />
                <span>Открыть</span>
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={emergencyStop}
              >
                <AlertOctagon size={14} />
                <span>Стоп</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={connectToChatGPT}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  Подключение...
                </>
              ) : (
                <>
                  <ExternalLink size={14} />
                  <span>Подключить ChatGPT</span>
                </>
              )}
            </Button>
          )}
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
