
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Task } from "@/types/types";
import { commandService } from "@/services/CommandService";
import { logService } from "@/services/LogService";
import { toast } from "sonner";

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
  if (context === undefined) {
    throw new Error("useTaskScheduler must be used within a TaskSchedulerProvider");
  }
  return context;
};

interface TaskSchedulerProviderProps {
  children: React.ReactNode;
}

export const TaskSchedulerProvider: React.FC<TaskSchedulerProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);
  const [taskTimers, setTaskTimers] = useState<Record<string, number>>({});

  // Load tasks from localStorage when component mounts
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('eiros_scheduled_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Failed to load scheduled tasks from storage',
        timestamp: Date.now()
      });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('eiros_scheduled_tasks', JSON.stringify(tasks));
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Failed to save scheduled tasks to storage',
        timestamp: Date.now()
      });
    }
  }, [tasks]);

  // Setup and clear intervals for tasks
  useEffect(() => {
    // Clear existing timers
    Object.values(taskTimers).forEach(timerId => window.clearInterval(timerId));
    const newTimers: Record<string, number> = {};
    
    // Only set up new timers if execution is not paused
    if (!isExecutionPaused) {
      tasks.forEach(task => {
        if (task.active) {
          const timerId = window.setInterval(() => {
            executeTask(task);
          }, task.interval * 1000); // Convert to milliseconds
          
          newTimers[task.id] = timerId;
        }
      });
    }
    
    setTaskTimers(newTimers);
    
    // Cleanup when component unmounts
    return () => {
      Object.values(newTimers).forEach(timerId => window.clearInterval(timerId));
    };
  }, [tasks, isExecutionPaused]);

  const executeTask = useCallback((task: Task) => {
    logService.addLog({
      type: 'info',
      message: `Executing scheduled task: ${task.name}`,
      timestamp: Date.now()
    });
    
    try {
      if (task.type === 'command') {
        // Parse and execute DSL command
        const command = commandService.parseCommand(task.content);
        if (command) {
          commandService.executeCommand(command)
            .then(() => {
              logService.addLog({
                type: 'success',
                message: `Task "${task.name}" executed successfully`,
                timestamp: Date.now()
              });
            })
            .catch(error => {
              logService.addLog({
                type: 'error',
                message: `Task "${task.name}" execution failed: ${error.message}`,
                timestamp: Date.now(),
                details: error
              });
            });
        } else {
          throw new Error('Invalid command format');
        }
      } else if (task.type === 'message') {
        // Handle message tasks (could be used for notifications or other purposes)
        toast(task.content);
        logService.addLog({
          type: 'info',
          message: `Message task "${task.name}" displayed: ${task.content}`,
          timestamp: Date.now()
        });
      }
      
      // Update last run timestamp
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, lastRun: Date.now() } : t
        )
      );
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Failed to execute task "${task.name}"`,
        timestamp: Date.now(),
        details: error
      });
    }
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
    toast.success(`Task "${task.name}" scheduled successfully`);
  }, []);

  const removeTask = useCallback((id: string) => {
    // Clear the interval if it exists
    if (taskTimers[id]) {
      window.clearInterval(taskTimers[id]);
    }
    
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    toast.info(`Task removed from scheduler`);
  }, [taskTimers]);

  const toggleTaskActive = useCallback((id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, active: !task.active } : task
      )
    );
  }, []);

  const toggleExecutionPause = useCallback(() => {
    setIsExecutionPaused(prev => !prev);
    toast(isExecutionPaused ? 'Task execution resumed' : 'Task execution paused');
  }, [isExecutionPaused]);

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
