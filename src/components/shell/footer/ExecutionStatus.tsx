
import React from 'react';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ExecutionStatus: React.FC = () => {
  const { t } = useLanguage();
  
  // Safely access TaskScheduler context
  let isExecutionPaused = false;
  
  try {
    const taskScheduler = useTaskScheduler();
    isExecutionPaused = taskScheduler?.isExecutionPaused || false;
  } catch (error) {
    console.error('TaskScheduler context not available:', error);
    return null;
  }
  
  if (!isExecutionPaused) return null;
  
  return (
    <span className="ml-2 text-amber-500">⏸ {t('pause')}</span>
  );
};

export default ExecutionStatus;
