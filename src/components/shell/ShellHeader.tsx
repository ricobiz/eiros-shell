
import React, { useEffect } from 'react';
import HeaderButtons from './header/HeaderButtons';
import TitleEditor from './header/TitleEditor';
import HeaderActions from './header/HeaderActions';

const ShellHeader: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandToggle = () => {
    setExpanded(!expanded);
    // Dispatch custom event to notify other components
    const event = new CustomEvent('shell-expand', { detail: !expanded });
    window.dispatchEvent(event);
  };

  // Listen for changes in expanded state from other components
  useEffect(() => {
    const handleExternalExpand = (e: CustomEvent<boolean>) => {
      setExpanded(e.detail);
    };
    
    window.addEventListener('shell-expand' as any, handleExternalExpand);
    
    return () => {
      window.removeEventListener('shell-expand' as any, handleExternalExpand);
    };
  }, []);

  return (
    <div className="bg-muted/30 px-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HeaderButtons />
          <TitleEditor />
        </div>
        
        <HeaderActions expanded={expanded} onExpandToggle={handleExpandToggle} />
      </div>
    </div>
  );
};

export default ShellHeader;
