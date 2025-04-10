
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { Task } from '@/types/types';

const TaskScheduler: React.FC = () => {
  const { tasks, addTask, removeTask, toggleTaskActive, updateTask } = useTaskScheduler();
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'command',
    content: '',
    interval: 60,
    active: true,
    name: ''
  });
  
  const handleAddTask = () => {
    if (newTask.content && newTask.interval) {
      addTask({
        id: Date.now().toString(),
        type: newTask.type || 'command',
        content: newTask.content,
        interval: newTask.interval,
        active: true,
        name: newTask.name || `Task ${tasks.length + 1}`
      });
      
      // Reset form
      setNewTask({
        type: 'command',
        content: '',
        interval: 60,
        active: true,
        name: ''
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">Task Scheduler</div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input 
            placeholder="Task name" 
            value={newTask.name || ''} 
            onChange={(e) => setNewTask({...newTask, name: e.target.value})}
          />
          
          <Select 
            value={newTask.type} 
            onValueChange={(value) => setNewTask({...newTask, type: value as 'message' | 'command'})}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="command">Command</SelectItem>
              <SelectItem value="message">Message</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            type="number" 
            placeholder="Interval (seconds)" 
            value={newTask.interval?.toString() || '60'} 
            onChange={(e) => setNewTask({...newTask, interval: Number(e.target.value)})}
          />
        </div>
        
        <Input 
          placeholder={newTask.type === 'command' ? '/command#id{params}' : 'Message text'} 
          value={newTask.content || ''} 
          onChange={(e) => setNewTask({...newTask, content: e.target.value})}
        />
        
        <Button onClick={handleAddTask}>Add Task</Button>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div>
                <div className="font-medium">{task.name}</div>
                <div className="text-xs text-muted-foreground">
                  {task.type === 'command' ? 'Command' : 'Message'} | Every {task.interval}s
                </div>
                <div className="text-xs truncate max-w-[300px]">{task.content}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={task.active} 
                  onCheckedChange={() => toggleTaskActive(task.id)} 
                />
                <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}>
                  <span className="sr-only">Delete</span>
                  <span>🗑️</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          No scheduled tasks
        </div>
      )}
    </div>
  );
};

export default TaskScheduler;
