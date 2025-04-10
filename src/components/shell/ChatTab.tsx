
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LogViewer from '../LogViewer';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatConnection } from '@/hooks/useChatConnection';
import ChatMessages from './chat/ChatMessages';
import ChatConnectionStatus from './chat/ChatConnectionStatus';
import ChatInput from './chat/ChatInput';
import { useToast } from '@/hooks/use-toast';
import { commandService } from '@/services/CommandService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useShell } from '@/contexts/shell/ShellContext';
import { AlertCircle } from 'lucide-react';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { testAIConnection, isTestingConnection } = useShell();
  
  const { 
    message, 
    setMessage, 
    chatHistory,
    sendMessage,
    addMessageToChat,
    clearChatHistory,
    handleAIResponse
  } = useChatMessages();
  
  const {
    isWindowOpen,
    isConnecting,
    connectToChatGPT,
    emergencyStop
  } = useChatConnection(addMessageToChat);
  
  // Only add welcome message if not connected
  useEffect(() => {
    if (!isConnectedToAI && !isWindowOpen && chatHistory.length === 0) {
      // Add a welcome message
      addMessageToChat('Система', t('shellWelcome'));
      // Add integration info message
      addMessageToChat('Система', 'Note: This shell uses clipboard integration with ChatGPT. After clicking the send button, you\'ll need to paste the message into the ChatGPT window.');
    }
  }, [isConnectedToAI, isWindowOpen, chatHistory.length, addMessageToChat, t]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handler for paste to get responses from ChatGPT
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Only if text is pasted and looks like a response from ChatGPT
    if (pastedText && pastedText.length > 10) {
      // Check if this is just a repeat paste of our own message
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (!lastMessage || lastMessage.sender !== 'Система' || 
          !lastMessage.message.includes(pastedText)) {
        // Process as AI response
        e.preventDefault();
        handleAIResponse(pastedText);
      }
    }
  };

  // Function for full bidirectional testing of ChatGPT connection
  const handleTestConnection = async () => {
    if (!isWindowOpen) {
      toast({
        description: t('connectionErrorDesc'),
        variant: "destructive"
      });
      return;
    }
    
    // Add a system message about testing
    addMessageToChat('Система', t('testingConnection'));
    
    // Call the testAIConnection function from useShell
    const success = await testAIConnection();
    
    if (success) {
      // Send a test command message that the shell should recognize
      const testMessage = "/test#integration_test{\"status\": \"verify\", \"message\": \"Testing bidirectional communication\"}";
      setMessage(testMessage);
      sendMessage();
      
      // Add explanation message with clearer instructions
      addMessageToChat('Система', 'Please paste the test message in ChatGPT. When ChatGPT responds, paste its response back here to complete the test.');
    } else {
      addMessageToChat('Система', t('testConnectionFailed'));
    }
  };
  
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="bg-muted/30 p-4 rounded-md flex-1 overflow-auto">
        <ChatMessages chatHistory={chatHistory} />
      </div>
      
      <div className="p-3 border rounded-md bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-400">
            This shell uses clipboard for ChatGPT integration. You need to manually paste messages into ChatGPT and copy responses back.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <ChatInput 
          message={message}
          disabled={!isWindowOpen}
          onChange={(e) => setMessage(e.target.value)}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          onTestConnection={handleTestConnection}
          isTestingConnection={isTestingConnection}
        />
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClearLogs}>
            {t('clearLogs')}
          </Button>
          
          <ChatConnectionStatus
            isWindowOpen={isWindowOpen}
            isConnecting={isConnecting}
            isTestingConnection={isTestingConnection}
            onConnectToChatGPT={connectToChatGPT}
            onEmergencyStop={emergencyStop}
            onTestConnection={handleTestConnection}
          />
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">{t('recentLogs')}</p>
        <div className="bg-muted/30 p-2 rounded-md max-h-[100px] overflow-auto">
          <LogViewer maxHeight="80px" maxLogs={10} />
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
