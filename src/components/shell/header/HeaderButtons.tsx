
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Settings, 
  AlertCircle, 
  LifeBuoy 
} from 'lucide-react';
import TaskScheduler from '@/components/TaskScheduler';
import { useTaskScheduler } from '@/contexts/TaskSchedulerContext';

const HeaderButtons: React.FC = () => {
  // Use optional chaining to prevent errors if context is not available
  const taskScheduler = useTaskScheduler();
  
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Terminal size={14} />
        <span className="text-xs">Console</span>
      </Button>
      
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Cpu size={14} />
        <span className="text-xs">System</span>
      </Button>
      
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Database size={14} />
        <span className="text-xs">Memory</span>
      </Button>
      
      <TaskScheduler />
      
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Settings size={14} />
        <span className="text-xs">Settings</span>
      </Button>
      
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <AlertCircle size={14} />
        <span className="text-xs">Help</span>
      </Button>
      
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <LifeBuoy size={14} />
        <span className="text-xs">Support</span>
      </Button>
    </div>
  );
};

export default HeaderButtons;
