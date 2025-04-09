
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ShellProvider } from '@/contexts/ShellContext';
import ShellContent from './shell/ShellContent';
import ShellHeader from './shell/ShellHeader';
import ShellFooter from './shell/ShellFooter';
import TabNavigation from './shell/TabNavigation';

const ShellInterface: React.FC = () => {
  return (
    <ShellProvider>
      <ShellContainer />
    </ShellProvider>
  );
};

const ShellContainer: React.FC = () => {
  const { activeTab, setActiveTab, isPinned } = useShell();
  
  return (
    <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
      <CardHeader className="p-2">
        <ShellHeader />
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabNavigation />
        
        <CardContent className="p-4">
          <ShellContent />
        </CardContent>
      </Tabs>
      
      <CardFooter className="p-2">
        <ShellFooter />
      </CardFooter>
    </Card>
  );
};

// Need to import the hook after defining the Provider to avoid circular dependency
import { useShell } from '@/contexts/ShellContext';

export default ShellInterface;
