
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FooterActionsProps {
  expanded: boolean;
  onExpandToggle: () => void;
}

const FooterActions: React.FC<FooterActionsProps> = ({ expanded, onExpandToggle }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center space-x-4">
      <button onClick={onExpandToggle} className="text-muted-foreground hover:text-foreground">
        {expanded ? '▲' : '▼'}
      </button>
      
      <div className="flex items-center">
        <span className="text-accent flex items-center font-serif">
          <span className="inline-flex space-x-0.5 mr-1.5">
            <span className="inline-block h-2 w-[3px] transform rotate-12 bg-accent animate-pulse"></span>
            <span className="inline-block h-2 w-[3px] transform rotate-12 bg-accent animate-pulse"></span>
            <span className="inline-block h-2 w-[3px] transform rotate-12 bg-accent animate-pulse"></span>
          </span>
          <span className="tracking-wide">
            SYMBIOTE ACTIVE
          </span>
        </span>
      </div>
    </div>
  );
};

export default FooterActions;
