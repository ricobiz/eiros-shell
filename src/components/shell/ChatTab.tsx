
import React from 'react';
import { Button } from '@/components/ui/button';
import LogViewer from '../LogViewer';

interface ChatTabProps {
  onClearLogs: () => void;
}

const ChatTab: React.FC<ChatTabProps> = ({ onClearLogs }) => {
  return (
    <div className="text-center py-8 space-y-3">
      <p className="text-muted-foreground">
        Chat history and interaction logs
      </p>
      <div className="bg-muted/30 p-4 rounded-md max-h-[300px] overflow-auto">
        <LogViewer maxHeight="250px" maxLogs={100} />
      </div>
      <Button variant="outline" size="sm" onClick={onClearLogs}>
        Clear Logs
      </Button>
    </div>
  );
};

export default ChatTab;
