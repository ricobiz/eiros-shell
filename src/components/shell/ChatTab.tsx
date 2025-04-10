
import React, { useEffect, useState } from 'react';
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
import { logService } from '@/services/LogService';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  console.log('ChatTab rendering with isConnectedToAI:', isConnectedToAI);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Access shell context safely
  const shellContext = useShell();
  const testAIConnection = shellContext.testAIConnection;
  const isTestingConnection = shellContext.isTestingConnection;
  
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

  // Function to add debug logs to UI
  const addDebugLog = (log: string) => {
    setDebugLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };
  
  // Only add welcome message if not connected
  useEffect(() => {
    console.log('ChatTab welcome message effect running', {
      isConnectedToAI,
      isWindowOpen,
      chatHistoryLength: chatHistory.length
    });
    
    if (!isConnectedToAI && !isWindowOpen && chatHistory.length === 0) {
      console.log('Adding welcome messages');
      // Add a welcome message
      addMessageToChat('Система', t('shellWelcome'));
      // Add integration info message
      addMessageToChat('Система', 'Shell is ready to communicate with ChatGPT. Connect to start automatic communication.');
    }
  }, [isConnectedToAI, isWindowOpen, chatHistory.length, addMessageToChat, t]);

  // Listen for messages from ChatGPT window
  useEffect(() => {
    console.log('Setting up ChatGPT message listener in ChatTab');
    addDebugLog('Setting up message listener');
    
    const handleMessage = (event: MessageEvent) => {
      // Check if this is a message from ChatGPT
      if (event.data && typeof event.data === 'object') {
        console.log('Received message event:', event.data);
        addDebugLog(`Received message event: ${JSON.stringify(event.data).substring(0, 50)}...`);
        
        if (event.data.type === 'CHATGPT_RESPONSE' || event.data.type === 'EIROS_RESPONSE') {
          console.log('Received message from ChatGPT in ChatTab:', event.data);
          addDebugLog(`Valid message from ChatGPT: ${event.data.type}`);
          
          // Process the response
          const messageContent = event.data.message || event.data.content || 'Empty response received';
          handleAIResponse(messageContent);
          
          // Log for debugging
          logService.addLog({
            type: 'success',
            message: 'Received message from ChatGPT',
            timestamp: Date.now(),
            details: { type: event.data.type, content: messageContent.substring(0, 50) + '...' }
          });
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('Removed ChatGPT message listener in ChatTab');
      addDebugLog('Removed message listener');
    };
  }, [handleAIResponse, addDebugLog]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced function for testing the connection with better debugging
  const handleTestConnection = async () => {
    console.log('Test connection button clicked');
    addDebugLog('Testing connection');
    
    if (!isWindowOpen) {
      console.log('Window not open, displaying error');
      addDebugLog('Error: Window not open');
      toast({
        description: t('connectionErrorDesc'),
        variant: "destructive"
      });
      return;
    }
    
    // Add a system message about testing
    addMessageToChat('Система', t('testingConnection'));
    
    // Get the ChatGPT window reference for direct testing
    const chatGPTWindow = aiSyncService.getChatGPTWindow?.();
    if (chatGPTWindow) {
      addDebugLog(`ChatGPT window reference exists: ${!chatGPTWindow.closed}`);
    } else {
      addDebugLog('Error: No ChatGPT window reference');
    }
    
    // Call the testAIConnection function from useShell
    console.log('Calling testAIConnection');
    addDebugLog('Testing bidirectional communication...');
    const success = await testAIConnection();
    console.log('Test result:', success);
    addDebugLog(`Test result: ${success ? 'Success' : 'Failed'}`);
    
    if (success) {
      // Send a test command message that the shell should recognize
      console.log('Test successful, sending integration test command');
      addDebugLog('Sending test command to ChatGPT');
      const testMessage = "/test#integration_test{\"status\": \"verify\", \"message\": \"Testing bidirectional communication\"}";
      
      // Send directly to ChatGPT
      const sent = aiSyncService.sendMessageToAI(testMessage);
      addDebugLog(`Test message sent: ${sent ? 'Success' : 'Failed'}`);
      
      if (sent) {
        // Add explanation message
        addMessageToChat('Система', 'Test message sent successfully. Testing bidirectional communication with ChatGPT...');
        
        // Test sending instructions
        console.log('Getting instructions file');
        const instructions = await aiSyncService.getInstructionsFile();
        if (instructions) {
          addMessageToChat('Система', 'Sending integration instructions to ChatGPT...');
          const instructionSent = aiSyncService.sendMessageToAI(
            "SHELL INSTRUCTIONS: Below are instructions for interacting with this shell:\n\n" + 
            instructions.substring(0, 500) + "..."
          );
          
          console.log('Instructions sent result:', instructionSent);
          addDebugLog(`Instructions sent: ${instructionSent ? 'Success' : 'Failed'}`);
          
          if (instructionSent) {
            addMessageToChat('Система', 'Instructions sent successfully');
          } else {
            addMessageToChat('Система', 'Failed to send instructions to ChatGPT');
          }
        }
      } else {
        addMessageToChat('Система', 'Failed to send test message to ChatGPT');
        addDebugLog('Error: Failed to send test message');
      }
    } else {
      console.log('Test failed');
      addMessageToChat('Система', t('testConnectionFailed'));
      addDebugLog('Connection test failed');
    }
  };
  
  // Function to debug the chat window manually
  const handleManualDebug = () => {
    try {
      const chatWindow = aiSyncService.getChatGPTWindow?.();
      if (!chatWindow) {
        addDebugLog('Error: No ChatGPT window reference available');
        return;
      }
      
      addDebugLog(`Window status: ${chatWindow.closed ? 'Closed' : 'Open'}`);
      
      // Try to access window properties as a basic test
      try {
        const windowLocation = chatWindow.location.href;
        addDebugLog(`Window location: ${windowLocation}`);
      } catch (e) {
        addDebugLog(`Error accessing window location: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      // Send a test message directly
      try {
        chatWindow.postMessage({
          type: 'EIROS_SHELL_MESSAGE',
          message: 'Manual debug test message'
        }, '*');
        addDebugLog('Test message sent directly to window');
      } catch (e) {
        addDebugLog(`Error sending test message: ${e instanceof Error ? e.message : String(e)}`);
      }
      
    } catch (e) {
      addDebugLog(`Debug error: ${e instanceof Error ? e.message : String(e)}`);
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClearLogs}>
              {t('clearLogs')}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleManualDebug}>
              Debug
            </Button>
          </div>
          
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
      
      {/* Debug logs panel */}
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">Debug Messages</p>
        <div className="bg-black/10 p-2 rounded-md max-h-[150px] overflow-auto text-xs font-mono">
          {debugLogs.length > 0 ? (
            debugLogs.map((log, i) => (
              <div key={i} className="text-xs">{log}</div>
            ))
          ) : (
            <div className="text-muted-foreground italic">No debug logs yet</div>
          )}
        </div>
        <div className="flex justify-end mt-1">
          <Button size="sm" variant="ghost" onClick={() => setDebugLogs([])}>
            Clear Debug
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
