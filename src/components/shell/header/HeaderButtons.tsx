
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
    <div className="flex items-center gap-0.5 mr-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => handleToggleAIConnection()} 
              className="h-7 w-7 flex items-center justify-center rounded-none hover:bg-muted/50 transition-colors border border-green-500/30"
              aria-label={isConnectedToAI ? t('disconnect') : t('connect')}
            >
              <div className="flex space-x-0.5 items-center justify-center">
                <div className="h-3 w-0.5 transform rotate-12 bg-green-500"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-green-500"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-green-500"></div>
              </div>
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
              className="h-7 w-7 flex items-center justify-center rounded-none hover:bg-muted/50 transition-colors border border-amber-500/30"
              aria-label={isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
            >
              <div className="flex space-x-0.5 items-center justify-center">
                <div className="h-3 w-0.5 transform rotate-12 bg-[#FFBD44]"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-[#FFBD44]"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-[#FFBD44]"></div>
              </div>
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
              className="h-7 w-7 flex items-center justify-center rounded-none hover:bg-muted/50 transition-colors border border-destructive/30"
              aria-label={t('emergencyStop')}
            >
              <div className="flex space-x-0.5 items-center justify-center">
                <div className="h-3 w-0.5 transform rotate-12 bg-destructive"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-destructive"></div>
                <div className="h-3 w-0.5 transform rotate-12 bg-destructive"></div>
              </div>
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
