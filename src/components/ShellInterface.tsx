
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ShellProvider, useShell } from '@/contexts/shell/ShellContext';
import ShellContent from './shell/ShellContent';
import ShellHeader from './shell/ShellHeader';
import ShellFooter from './shell/ShellFooter';
import TabNavigation from './shell/TabNavigation';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { LanguageProvider } from '@/contexts/LanguageContext';

const ShellInterface: React.FC = () => {
  return (
    <LanguageProvider>
      <ShellProvider>
        <ShellContainer />
      </ShellProvider>
    </LanguageProvider>
  );
};

const ShellContainer: React.FC = () => {
  const { activeTab, setActiveTab, isPinned } = useShell();
  const [expanded, setExpanded] = useState(false);
  
  // Listen for changes in expanded state from header component
  React.useEffect(() => {
    const handleExpand = (e: CustomEvent) => {
      setExpanded(e.detail);
    };
    
    window.addEventListener('shell-expand' as any, handleExpand);
    
    return () => {
      window.removeEventListener('shell-expand' as any, handleExpand);
    };
  }, []);
  
  return (
    <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
      <CardHeader className="p-2">
        <ShellHeader />
      </CardHeader>
      
      <Collapsible open={expanded} className="w-full">
        <CollapsibleContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabNavigation />
            
            <CardContent className="p-4">
              <ShellContent />
            </CardContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
      
      <CardFooter className="p-2">
        <ShellFooter />
      </CardFooter>
    </Card>
  );
};

export default ShellInterface;
