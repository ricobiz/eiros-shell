
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShell } from '@/contexts/shell/ShellContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Command, MonitorSmartphone, Brain, MessageSquare, FileText, Pencil, Settings, Eye } from 'lucide-react';

const TabNavigation: React.FC = () => {
  const { activeTab } = useShell();
  const { t } = useLanguage();
  
  return (
    <TabsList className="grid grid-cols-9">
      <TabsTrigger value="command" className="flex items-center gap-1 text-xs">
        <Command className="h-3.5 w-3.5" />
        <span>{t('commandTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="browser" className="flex items-center gap-1 text-xs">
        <MonitorSmartphone className="h-3.5 w-3.5" />
        <span>{t('browserTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="vision" className="flex items-center gap-1 text-xs">
        <Eye className="h-3.5 w-3.5" />
        <span>{t('visionTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="annotate" className="flex items-center gap-1 text-xs">
        <Pencil className="h-3.5 w-3.5" />
        <span>{t('annotateTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="memory" className="flex items-center gap-1 text-xs">
        <Brain className="h-3.5 w-3.5" />
        <span>{t('memoryTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="chat" className="flex items-center gap-1 text-xs">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>{t('chatTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="instructions" className="flex items-center gap-1 text-xs">
        <FileText className="h-3.5 w-3.5" />
        <span>{t('instructionsTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="docs" className="flex items-center gap-1 text-xs">
        <FileText className="h-3.5 w-3.5" />
        <span>{t('docsTab')}</span>
      </TabsTrigger>
      
      <TabsTrigger value="system" className="flex items-center gap-1 text-xs">
        <Settings className="h-3.5 w-3.5" />
        <span>{t('systemTab') || 'System'}</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabNavigation;
