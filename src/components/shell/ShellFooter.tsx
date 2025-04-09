
import React from 'react';

interface ShellFooterProps {
  isPinned: boolean;
}

const ShellFooter: React.FC<ShellFooterProps> = ({ isPinned }) => {
  return (
    <div className="bg-muted/30 flex justify-between">
      <div className="text-xs text-muted-foreground">
        Status: <span className={`text-${isPinned ? 'accent' : 'muted-foreground'}`}>
          {isPinned ? 'Pinned' : 'Active'}
        </span>
      </div>
      
      <div className="flex items-center space-x-1 text-xs">
        <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse"/>
        <span className="text-muted-foreground">Listening for commands</span>
      </div>
    </div>
  );
};

export default ShellFooter;
