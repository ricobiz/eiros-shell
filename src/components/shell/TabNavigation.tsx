
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShell } from '@/contexts/shell/ShellContext';
import { useLanguage } from '@/contexts/LanguageContext';

const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useShell();
  const { t } = useLanguage();
  
  return (
    <TabsList className="grid grid-cols-7 w-full">
      <TabsTrigger value="instructions" onClick={() => setActiveTab('instructions')}>
        {t('instructions')}
      </TabsTrigger>
      <TabsTrigger value="command" onClick={() => setActiveTab('command')}>
        {t('command')}
      </TabsTrigger>
      <TabsTrigger value="browser" onClick={() => setActiveTab('browser')}>
        {t('browser')}
      </TabsTrigger>
      <TabsTrigger value="vision" onClick={() => setActiveTab('vision')}>
        {t('vision')}
      </TabsTrigger>
      <TabsTrigger value="memory" onClick={() => setActiveTab('memory')}>
        {t('memory')}
      </TabsTrigger>
      <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>
        {t('chat')}
      </TabsTrigger>
      <TabsTrigger value="docs" onClick={() => setActiveTab('docs')}>
        {t('docs')}
      </TabsTrigger>
    </TabsList>
  );
};

export default TabNavigation;
