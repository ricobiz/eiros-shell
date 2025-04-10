
import React from 'react';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ExecutionStatus: React.FC = () => {
  const { isExecutionPaused } = useTaskScheduler();
  const { t } = useLanguage();
  
  if (!isExecutionPaused) return null;
  
  return (
    <span className="ml-2 text-amber-500">⏸ {t('pause')}</span>
  );
};

export default ExecutionStatus;
