
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ExternalLink } from 'lucide-react';
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
  
  // Check connection status on component mount and set up periodic checks
  useEffect(() => {
    const checkConnectionStatus = () => {
      const isConnected = aiSyncService.isConnected();
      setIsWindowOpen(isConnected);
    };
    
    // Check initially
    checkConnectionStatus();
    
    // Set up interval to check connection status
    const intervalId = setInterval(checkConnectionStatus, 2000);
    
    // Connect automatically if not connected
    if (!isConnectedToAI) {
      aiSyncService.connectToAI().then(success => {
        if (success) {
          toast({
            title: "ChatGPT Connected",
            description: "Auto-connected to ChatGPT window",
          });
        }
      });
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isConnectedToAI, toast]);
  
  // Function to send a message
  const sendMessage = () => {
    if (message.trim()) {
      // Add message to chat history
      addMessageToChat('You', message);
      
      // Try to send the message (service will auto-reconnect if needed)
      aiSyncService.sendMessageToAI(message);
      
      // Add instruction for manual paste
      addMessageToChat('System', 'Please paste this message into ChatGPT: "' + message + '"');
      
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
                className={`flex ${chat.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.sender === 'You' 
                      ? 'bg-primary text-primary-foreground' 
                      : chat.sender === 'System'
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
            <p>Система автоматически подключится к ChatGPT</p>
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
          />
          <Button 
            variant="default" 
            size="icon"
            disabled={!message.trim()}
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
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Подключение...
            </div>
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
