
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import LogViewer from '../LogViewer';
import { aiSyncService } from '@/services/AISyncService';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: string; message: string; timestamp: number}[]>([]);
  const chatGPTWindowRef = useRef<Window | null>(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  
  // Function to open ChatGPT in a new window
  const openChatGPTWindow = () => {
    if (!chatGPTWindowRef.current || chatGPTWindowRef.current.closed) {
      const newWindow = window.open('https://chat.openai.com/', 'ChatGPT', 'width=800,height=600');
      chatGPTWindowRef.current = newWindow;
      
      if (newWindow) {
        setIsWindowOpen(true);
        aiSyncService.connectToAI();
        
        // Check periodically if the window is closed
        const checkWindowInterval = setInterval(() => {
          if (chatGPTWindowRef.current && chatGPTWindowRef.current.closed) {
            clearInterval(checkWindowInterval);
            setIsWindowOpen(false);
            aiSyncService.disconnectFromAI();
            addMessageToChat('System', 'Connection to ChatGPT closed');
          }
        }, 1000);
      } else {
        addMessageToChat('System', 'Failed to open ChatGPT window. Please check your popup blocker settings.');
      }
    } else {
      // Window already open, just focus it
      chatGPTWindowRef.current.focus();
    }
  };

  // Function to send test message
  const sendTestMessageToAI = () => {
    if (isConnectedToAI && isWindowOpen && chatGPTWindowRef.current) {
      const testMessage = 'Test message from AI Shell';
      addMessageToChat('You', testMessage);
      
      // Focus the ChatGPT window
      chatGPTWindowRef.current.focus();
      
      // Add instruction to manually paste the message
      addMessageToChat('System', 'Please paste this test message into ChatGPT manually: "' + testMessage + '"');
      
      aiSyncService.sendMessageToAI(testMessage);
    } else if (!isWindowOpen) {
      openChatGPTWindow();
    }
  };
  
  // Function to send a message
  const sendMessage = () => {
    if (message.trim()) {
      if (isConnectedToAI && isWindowOpen && chatGPTWindowRef.current) {
        aiSyncService.sendMessageToAI(message);
        addMessageToChat('You', message);
        
        // Focus the ChatGPT window
        chatGPTWindowRef.current.focus();
        
        // Add instruction to manually paste the message
        addMessageToChat('System', 'Please paste this message into ChatGPT manually: "' + message + '"');
        
        setMessage('');
      } else if (!isWindowOpen) {
        // If not connected yet, open the window first
        openChatGPTWindow();
        
        // Then save the message to send after connection
        addMessageToChat('You', message);
        addMessageToChat('System', 'Please paste this message into ChatGPT manually after it loads: "' + message + '"');
        aiSyncService.sendMessageToAI(message);
        setMessage('');
      }
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
  
  // Connect to AI when the component mounts if isConnectedToAI is true
  useEffect(() => {
    if (isConnectedToAI && !isWindowOpen) {
      openChatGPTWindow();
    }
    
    return () => {
      // Close window when component unmounts
      if (chatGPTWindowRef.current && !chatGPTWindowRef.current.closed) {
        chatGPTWindowRef.current.close();
      }
    };
  }, [isConnectedToAI]);

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
            {isConnectedToAI 
              ? 'Send a message to start chatting with AI'
              : 'Connect to AI to start a conversation'}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder={isConnectedToAI ? "Type your message..." : "Connect to AI first..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnectedToAI}
            className="flex-1"
          />
          <Button 
            variant="default" 
            size="icon" 
            disabled={!isConnectedToAI || !message.trim()}
            onClick={sendMessage}
          >
            <Send size={16} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClearLogs}>
              Clear Logs
            </Button>
            <Button 
              variant={isConnectedToAI ? "outline" : "default"} 
              size="sm" 
              onClick={isConnectedToAI ? sendTestMessageToAI : openChatGPTWindow}
            >
              {isConnectedToAI ? "Test AI Connection" : "Open ChatGPT"}
            </Button>
          </div>
          
          {isWindowOpen ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
              ChatGPT Window Open
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              ChatGPT Window Closed
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">Logs:</p>
        <div className="bg-muted/30 p-2 rounded-md max-h-[100px] overflow-auto">
          <LogViewer maxHeight="80px" maxLogs={10} />
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
