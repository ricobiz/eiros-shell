
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { useShell } from '@/contexts/shell/ShellContext';
import ShellContent from './ShellContent';
import ShellHeader from './ShellHeader';
import ShellFooter from './ShellFooter';
import TabNavigation from './TabNavigation';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import DiagnosticPanel from '../DiagnosticPanel';
import DebugOverlay from '../DebugOverlay';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Bug, CheckCircle } from 'lucide-react';

const ShellContainer: React.FC = () => {
  const { activeTab, setActiveTab, isPinned } = useShell();
  const [expanded, setExpanded] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();
  
  // Listen for changes in expanded state from header component
  React.useEffect(() => {
    const handleExpand = (e: CustomEvent<boolean>) => {
      setExpanded(e.detail);
    };
    
    window.addEventListener('shell-expand' as any, handleExpand);
    
    return () => {
      window.removeEventListener('shell-expand' as any, handleExpand);
    };
  }, []);
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    
    if (!debugMode) {
      // Enable debug mode
      toast({
        title: "Debug Mode Activated",
        description: "Step-by-step execution and detailed logging enabled"
      });
      setShowDebugOverlay(true);
    } else {
      // Disable debug mode
      toast({
        description: "Debug Mode Deactivated"
      });
      setShowDebugOverlay(false);
    }
  };
  
  return (
    <>
      <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
        <CardHeader className="p-2">
          <div className="flex justify-between items-center">
            <ShellHeader />
            
            {/* Debug Toggle Button */}
            <Button 
              variant={debugMode ? "default" : "outline"}
              size="sm" 
              className="h-7"
              onClick={toggleDebugMode}
            >
              {debugMode ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Debug Active</span>
                </>
              ) : (
                <>
                  <Bug className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Debug Mode</span>
                </>
              )}
            </Button>
          </div>
          
          {/* Diagnostics Panel - Only show when specifically requested or during debug mode */}
          {(showDiagnostics || debugMode) && <div className="mt-2"><DiagnosticPanel /></div>}
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
      
      {/* Debug Overlay */}
      {showDebugOverlay && <DebugOverlay onClose={() => setShowDebugOverlay(false)} />}
    </>
  );
};

export default ShellContainer;
