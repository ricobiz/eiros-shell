
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { aiSyncService } from '@/services/ai-sync';
import { useLanguage } from './LanguageContext';

export interface ScheduledTask {
  id: string;
  message: string;
  interval: number;
  enabled: boolean;
}

interface TaskSchedulerContextType {
  tasks: ScheduledTask[];
  addTask: (message: string, interval: number) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  isExecutionPaused: boolean;
  toggleExecutionPause: () => void;
}

const TaskSchedulerContext = createContext<TaskSchedulerContextType | undefined>(undefined);

export const TaskSchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => {
    const savedTasks = localStorage.getItem('scheduledTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);
  const [intervalIds, setIntervalIds] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem('scheduledTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Clear existing intervals when tasks change or pause status changes
    Object.values(intervalIds).forEach(id => window.clearInterval(id));
    
    if (isExecutionPaused) {
      setIntervalIds({});
      return;
    }

    // Set up new intervals for enabled tasks
    const newIntervalIds: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.enabled) {
        const id = window.setInterval(() => {
          aiSyncService.sendMessage(task.message);
        }, task.interval * 1000);
        
        newIntervalIds[task.id] = id as unknown as number;
      }
    });
    
    setIntervalIds(newIntervalIds);
    
    return () => {
      // Clean up intervals on unmount
      Object.values(newIntervalIds).forEach(id => window.clearInterval(id));
    };
  }, [tasks, isExecutionPaused]);

  const addTask = (message: string, interval: number) => {
    const newTask: ScheduledTask = {
      id: `task_${Date.now()}`,
      message,
      interval,
      enabled: true
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: t('taskScheduled'),
      description: `${message} (${interval}s)`,
    });
  };

  const removeTask = (id: string) => {
    // Clear the interval first
    if (intervalIds[id]) {
      window.clearInterval(intervalIds[id]);
      const newIntervalIds = { ...intervalIds };
      delete newIntervalIds[id];
      setIntervalIds(newIntervalIds);
    }
    
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    
    toast({
      title: t('taskDeleted'),
      description: id,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, enabled: !task.enabled } : task
      )
    );
  };

  const toggleExecutionPause = () => {
    setIsExecutionPaused(prev => !prev);
  };

  return (
    <TaskSchedulerContext.Provider value={{
      tasks,
      addTask,
      removeTask,
      toggleTask,
      isExecutionPaused,
      toggleExecutionPause
    }}>
      {children}
    </TaskSchedulerContext.Provider>
  );
};

export const useTaskScheduler = (): TaskSchedulerContextType => {
  const context = useContext(TaskSchedulerContext);
  if (context === undefined) {
    throw new Error('useTaskScheduler must be used within a TaskSchedulerProvider');
  }
  return context;
};
