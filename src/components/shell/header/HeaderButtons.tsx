
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
  const { t } = useLanguage();
  
  // Safely access the TaskScheduler context, with fallback values
  let isExecutionPaused = false;
  let toggleExecutionPause = () => {};
  
  try {
    const taskScheduler = useTaskScheduler();
    isExecutionPaused = taskScheduler?.isExecutionPaused || false;
    toggleExecutionPause = taskScheduler?.toggleExecutionPause || (() => {});
  } catch (error) {
    console.error('TaskScheduler context not available:', error);
  }
  
  return (
    <div className="flex items-center gap-3 mr-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => handleToggleAIConnection()} 
              className="h-7 flex items-center justify-center"
              aria-label={isConnectedToAI ? t('disconnect') : t('connect')}
            >
              <div className="w-[3px] h-5 bg-green-500 transform rotate-45"></div>
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
              className="h-7 flex items-center justify-center"
              aria-label={isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
            >
              <div className="w-[3px] h-5 bg-[#FFBD44] transform rotate-45"></div>
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
              className="h-7 flex items-center justify-center"
              aria-label={t('emergencyStop')}
            >
              <div className="w-[3px] h-5 bg-destructive transform rotate-45"></div>
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
