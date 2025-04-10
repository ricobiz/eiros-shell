
import React from 'react';
import ConnectionStatus from './footer/ConnectionStatus';
import ExecutionStatus from './footer/ExecutionStatus';
import FooterActions from './footer/FooterActions';

const ShellFooter: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);

  // Handle expand toggle and dispatch custom event
  const handleExpandClick = () => {
    const newState = !expanded;
    setExpanded(newState);
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('shell-expand', { detail: newState }));
  };

  return (
    <div className="bg-muted/30 flex justify-between px-2 py-1 text-xs w-full">
      <div className="flex items-center">
        <ConnectionStatus />
        <ExecutionStatus />
      </div>
      
      <FooterActions expanded={expanded} onExpandToggle={handleExpandClick} />
    </div>
  );
};

export default ShellFooter;
