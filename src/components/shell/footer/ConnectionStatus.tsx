
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useShell } from '@/contexts/shell/ShellContext';

const ConnectionStatus: React.FC = () => {
  const { isPinned } = useShell();
  const { t } = useLanguage();

  return (
    <div className="text-muted-foreground flex items-center">
      <span className={`inline-block h-2 w-2 rounded-full mr-1 ${isPinned ? 'bg-accent' : 'bg-muted-foreground'}`}/>
      <span>{isPinned ? t('pinned') : t('active')}</span>
    </div>
  );
};

export default ConnectionStatus;
