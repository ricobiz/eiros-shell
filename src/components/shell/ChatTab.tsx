
import React from 'react';
import { Button } from '@/components/ui/button';
import LogViewer from '../LogViewer';
import { aiSyncService } from '@/services/AISyncService';

interface ChatTabProps {
  onClearLogs: () => void;
  isConnectedToAI?: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs, isConnectedToAI = false }) => {
  const sendTestMessageToAI = () => {
    if (isConnectedToAI) {
      aiSyncService.sendMessageToAI('Test message from shell');
    }
  };

  return (
    <div className="text-center py-8 space-y-3">
      <p className="text-muted-foreground">
        Chat history and interaction logs
      </p>
      <div className="bg-muted/30 p-4 rounded-md max-h-[300px] overflow-auto">
        <LogViewer maxHeight="250px" maxLogs={100} />
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Button variant="outline" size="sm" onClick={onClearLogs}>
          Clear Logs
        </Button>
        {isConnectedToAI && (
          <Button variant="outline" size="sm" onClick={sendTestMessageToAI}>
            Test AI Connection
          </Button>
        )}
      </div>
      {isConnectedToAI && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
          Connected to AI
        </div>
      )}
    </div>
  );
};

export default ChatTab;
