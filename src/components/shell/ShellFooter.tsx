
import React from 'react';
import { useShell } from '@/contexts/shell/ShellContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';

const ShellFooter: React.FC = () => {
  const { isPinned, isConnectedToAI } = useShell();
  const { isExecutionPaused } = useTaskScheduler();
  const { t } = useLanguage();
  const [expanded, setExpanded] = React.useState(false);

  // Кнопка для разворачивания интерфейса
  const handleExpandClick = () => {
    const newState = !expanded;
    setExpanded(newState);
    // Отправляем событие для обновления состояния в ShellInterface
    window.dispatchEvent(new CustomEvent('shell-expand', { detail: newState }));
  };

  return (
    <div className="bg-muted/30 flex justify-between px-2 py-1 text-xs w-full">
      <div className="text-muted-foreground flex items-center">
        <span className={`inline-block h-2 w-2 rounded-full mr-1 ${isPinned ? 'bg-accent' : 'bg-muted-foreground'}`}/>
        <span>{isPinned ? t('pinned') : t('active')}</span>
        
        {isExecutionPaused && (
          <span className="ml-2 text-amber-500">⏸ {t('pause')}</span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={handleExpandClick} className="text-muted-foreground hover:text-foreground">
          {expanded ? '▲' : '▼'}
        </button>
        
        <div className="flex items-center space-x-1">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse"/>
          <span className="text-muted-foreground">{t('listening')}</span>
        </div>
      </div>
    </div>
  );
};

export default ShellFooter;
