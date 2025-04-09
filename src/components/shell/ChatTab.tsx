
import React, { useState } from 'react';
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

  const sendTestMessageToAI = () => {
    if (isConnectedToAI) {
      aiSyncService.sendMessageToAI('Test message from shell');
      addMessageToChat('You', 'Test message from shell');
      
      // Simulate AI response after a delay
      setTimeout(() => {
        addMessageToChat('AI', 'Received your test message. I am ready to assist you.');
      }, 1000);
    }
  };
  
  const sendMessage = () => {
    if (message.trim() && isConnectedToAI) {
      aiSyncService.sendMessageToAI(message);
      addMessageToChat('You', message);
      setMessage('');
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const responses = [
          'I understand your message. How can I help further?',
          'That\'s an interesting point. Would you like more information?',
          'I'm processing your request. Is there anything specific you're looking for?',
          'Thanks for sharing. Let me know if you need any assistance.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat('AI', randomResponse);
      }, 1500);
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
            {isConnectedToAI && (
              <Button variant="outline" size="sm" onClick={sendTestMessageToAI}>
                Test AI Connection
              </Button>
            )}
          </div>
          
          {isConnectedToAI ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
              Connected to AI
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              Disconnected
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
