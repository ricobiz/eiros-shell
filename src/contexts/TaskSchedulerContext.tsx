
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task } from '@/types/types';
import { toast } from '@/hooks/use-toast';
import { aiSyncService } from '@/services/ai-sync';
import { useLanguage } from './LanguageContext';

interface TaskSchedulerContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  removeTask: (taskId: string) => void;
  toggleTaskActive: (taskId: string) => void;
  isExecutionPaused: boolean;
  toggleExecutionPause: () => void;
}

const TaskSchedulerContext = createContext<TaskSchedulerContextType | undefined>(undefined);

interface TaskSchedulerProviderProps {
  children: React.ReactNode;
}

export const TaskSchedulerProvider: React.FC<TaskSchedulerProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);
  const { t } = useLanguage();
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('scheduledTasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Failed to parse stored tasks', error);
      }
    }
  }, []);
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduledTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Task execution effect
  useEffect(() => {
    if (isExecutionPaused) return;
    
    const intervalIds: NodeJS.Timeout[] = [];
    
    tasks.forEach(task => {
      if (!task.active) return;
      
      const interval = setInterval(() => {
        if (isExecutionPaused) return;
        
        // Execute the task
        try {
          if (task.type === 'message' && task.content) {
            // Use the aiSyncService to send a message
            if (aiSyncService.isConnected()) {
              // The aiSyncService should have a method to send messages to ChatGPT
              aiSyncService.sendMessageToAI(task.content);
              
              toast({
                title: t('taskExecuted'),
                description: `${t('sentMessage')}: "${task.content.substring(0, 30)}${task.content.length > 30 ? '...' : ''}"`,
              });
            } else {
              toast({
                title: t('taskFailed'),
                description: t('notConnectedToAI'),
                variant: "destructive",
              });
            }
          } else if (task.type === 'command' && task.content) {
            // Execute command logic would go here
            console.log('Executing command:', task.content);
            
            toast({
              title: t('taskExecuted'),
              description: `${t('executedCommand')}: "${task.content.substring(0, 30)}${task.content.length > 30 ? '...' : ''}"`,
            });
          }
        } catch (error) {
          console.error('Failed to execute scheduled task', error);
          toast({
            title: t('taskFailed'),
            description: String(error),
            variant: "destructive",
          });
        }
      }, task.interval * 1000); // Convert to milliseconds
      
      intervalIds.push(interval);
    });
    
    // Cleanup function to clear all intervals
    return () => {
      intervalIds.forEach(id => clearInterval(id));
    };
  }, [tasks, isExecutionPaused, t]);
  
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      active: true
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    toast({
      title: t('taskAdded'),
      description: t('taskScheduledEvery').replace('{interval}', String(task.interval)),
    });
  };
  
  const removeTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    toast({
      title: t('taskRemoved'),
      description: t('taskRemovedDesc'),
    });
  };
  
  const toggleTaskActive = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, active: !task.active } 
          : task
      )
    );
  };
  
  const toggleExecutionPause = () => {
    setIsExecutionPaused(prev => !prev);
    
    toast({
      title: !isExecutionPaused ? t('executionPaused') : t('executionResumed'),
      description: !isExecutionPaused ? t('allTasksPaused') : t('allTasksResumed'),
    });
  };
  
  return (
    <TaskSchedulerContext.Provider value={{
      tasks,
      addTask,
      removeTask,
      toggleTaskActive,
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
