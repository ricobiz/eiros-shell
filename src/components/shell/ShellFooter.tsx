
import React from 'react';

interface ShellFooterProps {
  isPinned: boolean;
}

const ShellFooter: React.FC<ShellFooterProps> = ({ isPinned }) => {
  return (
    <div className="bg-muted/30 flex justify-between px-2 py-1 text-xs">
      <div className="text-muted-foreground flex items-center">
        <span className={`inline-block h-2 w-2 rounded-full mr-1 ${isPinned ? 'bg-accent' : 'bg-muted-foreground'}`}/>
        <span>{isPinned ? 'Pinned' : 'Active'}</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse"/>
        <span className="text-muted-foreground">Listening</span>
      </div>
    </div>
  );
};

export default ShellFooter;
