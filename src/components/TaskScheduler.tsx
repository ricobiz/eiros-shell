
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const TaskScheduler: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskCommand, setTaskCommand] = useState('');
  const [taskInterval, setTaskInterval] = useState('60');
  const [intervalType, setIntervalType] = useState('minutes');
  
  const taskScheduler = useTaskScheduler();
  
  const handleAddTask = () => {
    if (!taskName || !taskCommand) {
      toast({
        description: "Task name and command are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert interval to milliseconds
      let intervalMs = parseInt(taskInterval);
      switch (intervalType) {
        case 'seconds':
          intervalMs *= 1000;
          break;
        case 'minutes':
          intervalMs *= 60 * 1000;
          break;
        case 'hours':
          intervalMs *= 60 * 60 * 1000;
          break;
      }
      
      taskScheduler.addTask({
        id: `task-${Date.now()}`,
        name: taskName,
        type: 'command',
        content: taskCommand,
        interval: intervalMs,
        active: true,
        lastRun: Date.now()
      });
      
      toast({
        description: `Task "${taskName}" has been scheduled`,
      });
      
      setTaskName('');
      setTaskCommand('');
      setOpen(false);
    } catch (error) {
      toast({
        description: `Failed to schedule task: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Clock size={14} />
                <span className="text-xs">Scheduler</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Schedule recurring tasks
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Task</DialogTitle>
          <DialogDescription>
            Create a recurring task that will execute automatically
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input 
              id="taskName" 
              placeholder="Check emails" 
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taskCommand">Command</Label>
            <Input 
              id="taskCommand" 
              placeholder='/navigate#mail{"url":"https://mail.example.com"}' 
              value={taskCommand}
              onChange={e => setTaskCommand(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="interval">Repeat every</Label>
              <Input 
                id="interval" 
                type="number" 
                min="1"
                value={taskInterval}
                onChange={e => setTaskInterval(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intervalType">Interval</Label>
              <Select value={intervalType} onValueChange={setIntervalType}>
                <SelectTrigger id="intervalType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTask}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskScheduler;
