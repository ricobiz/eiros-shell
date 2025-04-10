
import React, { createContext, useContext, useState } from 'react';
import { Task } from '../types/types';

interface TaskSchedulerContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  toggleTaskActive: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  isExecutionPaused: boolean;
  toggleExecutionPause: () => void;
}

const TaskSchedulerContext = createContext<TaskSchedulerContextType>({
  tasks: [],
  addTask: () => {},
  removeTask: () => {},
  toggleTaskActive: () => {},
  updateTask: () => {},
  isExecutionPaused: false,
  toggleExecutionPause: () => {}
});

export const useTaskScheduler = () => useContext(TaskSchedulerContext);

export const TaskSchedulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
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

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
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
      toggleTaskActive,
      updateTask,
      isExecutionPaused,
      toggleExecutionPause
    }}>
      {children}
    </TaskSchedulerContext.Provider>
  );
};
