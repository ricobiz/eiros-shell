
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMediaQuery } from '@/hooks/use-mobile';

const TaskScheduler: React.FC = () => {
  const { tasks, addTask, removeTask, toggleTask } = useTaskScheduler();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [interval, setInterval] = useState(60);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && interval > 0) {
      addTask(message.trim(), interval);
      setMessage('');
    }
  };
  
  const TaskContent = () => (
    <div className="p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('message')}:</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('message')}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">{t('interval')}:</label>
          <Input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
            className="mt-1"
          />
        </div>
        
        <Button type="submit" className="w-full">
          {t('add')}
        </Button>
      </form>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t('scheduledTasks')}:</h3>
        
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scheduled tasks</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`p-2 border rounded-md flex justify-between items-center ${
                  task.enabled ? 'bg-muted/10' : 'bg-muted/30 opacity-70'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="font-medium truncate">{task.message}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock size={12} className="mr-1" />
                    {t('interval')}: {task.interval}s
                  </div>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleTask(task.id)}
                    className={task.enabled ? 'text-green-500' : 'text-muted-foreground'}
                  >
                    {task.enabled ? '✓' : '○'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  return isDesktop ? (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Calendar size={14} className="mr-1" />
          {t('schedule')}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('schedule')}</SheetTitle>
        </SheetHeader>
        <TaskContent />
      </SheetContent>
    </Sheet>
  ) : (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Calendar size={14} className="mr-1" />
          {t('schedule')}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('schedule')}</DrawerTitle>
        </DrawerHeader>
        <TaskContent />
      </DrawerContent>
    </Drawer>
  );
};

export default TaskScheduler;
