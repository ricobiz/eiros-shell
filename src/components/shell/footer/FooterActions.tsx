
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
        <span className="text-muted-foreground text-xs flex items-center font-serif">
          <span className="mr-1.5">
            <div className="w-[3px] h-3 bg-[#1EAEDB] transform rotate-12 inline-block"></div>
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
