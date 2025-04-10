
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
    <div className="flex space-x-2 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => handleToggleAIConnection()} 
              className="relative h-8 w-8 cursor-pointer flex items-center justify-center"
              aria-label={isConnectedToAI ? t('disconnect') : t('connect')}
            >
              <div className="absolute transform rotate-[45deg] h-5 w-[3px] bg-green-500 hover:bg-green-600 active:bg-green-700"></div>
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
              className="relative h-8 w-8 cursor-pointer flex items-center justify-center"
              aria-label={isExecutionPaused ? t('resumeExecution') : t('pauseExecution')}
            >
              <div className="absolute transform rotate-[45deg] h-5 w-[3px] bg-[#FFBD44] hover:bg-[#E0A93E] active:bg-[#C19435]"></div>
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
              className="relative h-8 w-8 cursor-pointer flex items-center justify-center"
              aria-label={t('emergencyStop')}
            >
              <div className="absolute transform rotate-[45deg] h-5 w-[3px] bg-destructive hover:bg-red-600 active:bg-red-700"></div>
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
