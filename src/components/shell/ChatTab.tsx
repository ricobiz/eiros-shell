
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
    }
  }, [isConnectedToAI, isWindowOpen, chatHistory.length, addMessageToChat, t]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Обработчик вставки для получения ответов от ChatGPT
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Только если текст вставлен и выглядит как ответ от ChatGPT
    // (можно добавить более сложную проверку)
    if (pastedText && pastedText.length > 10) {
      // Проверяем, не является ли это просто повторной вставкой нашего собственного сообщения
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (!lastMessage || lastMessage.sender !== 'Система' || 
          !lastMessage.message.includes(pastedText)) {
        // Обрабатываем как ответ от AI
        e.preventDefault();
        handleAIResponse(pastedText);
      }
    }
  };

  // Функция для полного тестирования связи с ChatGPT в обоих направлениях
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
      addMessageToChat('Система', t('testInstructions'));
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
