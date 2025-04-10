
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TerminalSquare, 
  Eye, 
  Database, 
  MessagesSquare, 
  Globe, 
  BookOpen
} from 'lucide-react';
import { useShell } from '@/contexts/shell/ShellContext';
import { useLanguage } from '@/contexts/LanguageContext';

const TabNavigation: React.FC = () => {
  const { activeTab } = useShell();
  const { t } = useLanguage();
  
  return (
    <div className="px-2 border-b">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="command" className={`${activeTab === 'command' ? 'font-medium' : ''} px-2 py-1`}>
          <TerminalSquare size={14} className="mr-1" />
          <span>{t('command')}</span>
        </TabsTrigger>
        
        <TabsTrigger value="vision" className={`${activeTab === 'vision' ? 'font-medium' : ''} px-2 py-1`}>
          <Eye size={14} className="mr-1" />
          <span>{t('vision')}</span>
        </TabsTrigger>
        
        <TabsTrigger value="memory" className={`${activeTab === 'memory' ? 'font-medium' : ''} px-2 py-1`}>
          <Database size={14} className="mr-1" />
          <span>{t('memory')}</span>
        </TabsTrigger>
        
        <TabsTrigger value="chat" className={`${activeTab === 'chat' ? 'font-medium' : ''} px-2 py-1`}>
          <MessagesSquare size={14} className="mr-1" />
          <span>{t('chat')}</span>
        </TabsTrigger>
        
        <TabsTrigger value="browser" className={`${activeTab === 'browser' ? 'font-medium' : ''} px-2 py-1`}>
          <Globe size={14} className="mr-1" />
          <span>{t('browser')}</span>
        </TabsTrigger>
        
        <TabsTrigger value="instructions" className={`${activeTab === 'instructions' ? 'font-medium' : ''} px-2 py-1`}>
          <BookOpen size={14} className="mr-1" />
          <span>{t('instructions')}</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default TabNavigation;
