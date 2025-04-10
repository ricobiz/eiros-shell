
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

interface TaskSchedulerContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  toggleTaskActive: (id: string) => void;
  isExecutionPaused: boolean;
  toggleExecutionPause: () => void;
}

const TaskSchedulerContext = createContext<TaskSchedulerContextType | undefined>(undefined);

export const useTaskScheduler = () => {
  const context = useContext(TaskSchedulerContext);
  if (!context) {
    throw new Error('useTaskScheduler must be used within a TaskSchedulerProvider');
  }
  return context;
};

export const TaskSchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);
  const { toast } = useToast();
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('scheduledTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    
    const savedPauseState = localStorage.getItem('executionPaused');
    if (savedPauseState) {
      setIsExecutionPaused(savedPauseState === 'true');
    }
  }, []);
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('scheduledTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save pause state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('executionPaused', String(isExecutionPaused));
  }, [isExecutionPaused]);
  
  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    toast({
      title: 'Task Added',
      description: `${task.name} has been scheduled to run every ${task.interval} seconds`,
    });
  };
  
  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const toggleTaskActive = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, active: !task.active } : task
      )
    );
  };
  
  const toggleExecutionPause = () => {
    setIsExecutionPaused(prev => !prev);
    toast({
      title: !isExecutionPaused ? 'Execution Paused' : 'Execution Resumed',
      description: !isExecutionPaused 
        ? 'All scheduled tasks are temporarily paused' 
        : 'Scheduled tasks will now resume execution',
    });
  };
  
  const value = {
    tasks,
    addTask,
    removeTask,
    toggleTaskActive,
    isExecutionPaused,
    toggleExecutionPause
  };
  
  return (
    <TaskSchedulerContext.Provider value={value}>
      {children}
    </TaskSchedulerContext.Provider>
  );
};
