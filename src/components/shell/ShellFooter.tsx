
import React from 'react';
import { Link } from 'lucide-react';
import { useShell } from '@/contexts/shell/ShellContext';

const ShellFooter: React.FC = () => {
  const { isPinned, isConnectedToAI } = useShell();

  return (
    <div className="bg-muted/30 flex justify-between px-2 py-1 text-xs w-full">
      <div className="text-muted-foreground flex items-center">
        <span className={`inline-block h-2 w-2 rounded-full mr-1 ${isPinned ? 'bg-accent' : 'bg-muted-foreground'}`}/>
        <span>{isPinned ? 'Pinned' : 'Active'}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        {isConnectedToAI && (
          <div className="flex items-center space-x-1">
            <Link size={12} className="text-green-500" />
            <span className="text-green-500">AI Connected</span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse"/>
          <span className="text-muted-foreground">Listening</span>
        </div>
      </div>
    </div>
  );
};

export default ShellFooter;
