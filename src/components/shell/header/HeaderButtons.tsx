
import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useShell } from '@/contexts/shell/ShellContext';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useLanguage } from '@/contexts/LanguageContext';

const HeaderButtons: React.FC = () => {
  const { isConnectedToAI, handleToggleAIConnection, handleEmergencyStop } = useShell();
  const { isExecutionPaused, toggleExecutionPause } = useTaskScheduler();
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-1 mr-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => handleToggleAIConnection()} 
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors border border-green-500/30"
              aria-label={isConnectedToAI ? t('disconnect') : t('connect')}
            >
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isConnectedToAI ? t('disconnect') : t('connect')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => toggleExecutionPause()} 
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors border border-amber-500/30"
              aria-label={isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
            >
              <div className="h-3 w-3 rounded-full bg-[#FFBD44]"></div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => handleEmergencyStop()} 
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors border border-destructive/30"
              aria-label={t('emergencyStop')}
            >
              <div className="h-3 w-3 rounded-full bg-destructive"></div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {t('emergencyStop')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default HeaderButtons;
