
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShell } from '@/contexts/shell/ShellContext';
import { 
  Terminal, 
  BookText, 
  Globe, 
  Eye, 
  Database,
  MessageSquare,
  FileText,
  Edit
} from 'lucide-react';

const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useShell();
  
  const tabConfig = [
    { id: 'command', icon: <Terminal className="h-4 w-4 mr-2" />, label: 'Command' },
    { id: 'instructions', icon: <BookText className="h-4 w-4 mr-2" />, label: 'Instructions' },
    { id: 'browser', icon: <Globe className="h-4 w-4 mr-2" />, label: 'Browser' },
    { id: 'vision', icon: <Eye className="h-4 w-4 mr-2" />, label: 'Vision' },
    { id: 'memory', icon: <Database className="h-4 w-4 mr-2" />, label: 'Memory' },
    { id: 'chat', icon: <MessageSquare className="h-4 w-4 mr-2" />, label: 'Chat' },
    { id: 'docs', icon: <FileText className="h-4 w-4 mr-2" />, label: 'Docs' },
    { id: 'annotate', icon: <Edit className="h-4 w-4 mr-2" />, label: 'Annotate' }
  ];
  
  return (
    <TabsList>
      {tabConfig.map(tab => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id}
          className="flex items-center"
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default TabNavigation;
