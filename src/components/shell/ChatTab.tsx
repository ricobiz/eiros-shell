
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
import { aiSyncService } from '@/services/ai-sync';

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
      addMessageToChat('Система', 'Shell is ready to communicate with ChatGPT. Connect to start automatic communication.');
    }
  }, [isConnectedToAI, isWindowOpen, chatHistory.length, addMessageToChat, t]);

  // Listen for messages from ChatGPT window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if this is a message from ChatGPT
      if (event.data && typeof event.data === 'object' && event.data.type === 'CHATGPT_RESPONSE') {
        console.log('Received message from ChatGPT:', event.data);
        // Process the response
        handleAIResponse(event.data.message);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleAIResponse]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
      
      // Add explanation message
      addMessageToChat('Система', 'Testing automatic bidirectional communication with ChatGPT...');
      
      // Test sending instructions
      const instructions = await aiSyncService.getInstructionsFile();
      if (instructions) {
        addMessageToChat('Система', 'Sending integration instructions to ChatGPT...');
        const instructionSent = aiSyncService.sendMessageToAI(
          "SHELL INSTRUCTIONS: Below are instructions for interacting with this shell:\n\n" + 
          instructions.substring(0, 500) + "..."
        );
        
        if (instructionSent) {
          addMessageToChat('Система', 'Instructions sent successfully');
        } else {
          addMessageToChat('Система', 'Failed to send instructions to ChatGPT');
        }
      }
    } else {
      addMessageToChat('Система', t('testConnectionFailed'));
    }
  };
  
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="bg-muted/30 p-4 rounded-md flex-1 overflow-auto">
        <ChatMessages chatHistory={chatHistory} />
      </div>
      
      <div className="space-y-3">
        <ChatInput 
          message={message}
          disabled={!isWindowOpen}
          onChange={(e) => setMessage(e.target.value)}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
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
