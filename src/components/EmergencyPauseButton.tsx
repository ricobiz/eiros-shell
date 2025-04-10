
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useLanguage } from '@/contexts/LanguageContext';

const EmergencyPauseButton: React.FC = () => {
  const { isExecutionPaused, toggleExecutionPause } = useTaskScheduler();
  const { t } = useLanguage();
  
  return (
    <Button 
      variant={isExecutionPaused ? "outline" : "destructive"}
      size="sm"
      className="h-8"
      onClick={toggleExecutionPause}
    >
      {isExecutionPaused ? (
        <>
          <Play size={14} className="mr-1" />
          <span className="text-xs">{t('resume')}</span>
        </>
      ) : (
        <>
          <Pause size={14} className="mr-1" />
          <span className="text-xs">{t('pause')}</span>
        </>
      )}
    </Button>
  );
};

export default EmergencyPauseButton;
