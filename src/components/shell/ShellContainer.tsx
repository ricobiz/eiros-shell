
import React, { useState, useEffect } from 'react';
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
import AutostartConfig from '../AutostartConfig';
import DebugOverlay from '../DebugOverlay';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Bug, CheckCircle, Settings } from 'lucide-react';

const ShellContainer: React.FC = () => {
  useEffect(() => {
    console.log('ShellContainer mounting - about to access context');
    try {
      // Test if we can access the context before using it
      const testContext = useShell();
      console.log('Context accessed successfully in ShellContainer:', 
        testContext ? 'Context exists with keys: ' + Object.keys(testContext).join(', ') : 'Context is empty');
    } catch (error) {
      console.error('Error accessing ShellContext in ShellContainer:', error);
    }
  }, []);

  // Safely try to access the shell context or provide fallback values
  let shell;
  let activeTab = 'command';
  let setActiveTab = (tab: string) => console.log('Fallback setActiveTab:', tab);
  let isPinned = false;
  let handleToggleAIConnection = () => console.log('Fallback handleToggleAIConnection');
  let handleEmergencyStop = () => console.log('Fallback handleEmergencyStop');
  let testAIConnection = async () => { console.log('Fallback testAIConnection'); return false; };
  let isTestingConnection = false;
  
  try {
    shell = useShell();
    activeTab = shell.activeTab;
    setActiveTab = shell.setActiveTab;
    isPinned = shell.isPinned;
    handleToggleAIConnection = shell.handleToggleAIConnection;
    handleEmergencyStop = shell.handleEmergencyStop;
    testAIConnection = shell.testAIConnection;
    isTestingConnection = shell.isTestingConnection;
    console.log('Successfully extracted shell properties');
  } catch (error) {
    console.error('Failed to access shell context:', error);
  }
  
  const [expanded, setExpanded] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showAutostart, setShowAutostart] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();
  
  // Listen for changes in expanded state from header component
  React.useEffect(() => {
    console.log('Setting up shell-expand listener');
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

  const toggleSettings = () => {
    setShowAutostart(!showAutostart);
    if (!showAutostart) {
      setShowDiagnostics(true); // Show diagnostics when showing settings
    }
  };
  
  return (
    <>
      <Card className={`w-full shadow-lg bg-card border-border ${isPinned ? 'border-accent border-2' : ''}`}>
        <CardHeader className="p-2">
          <div className="flex justify-between items-center">
            <ShellHeader />
            
            <div className="flex items-center space-x-2">
              {/* Settings Toggle Button */}
              <Button 
                variant={showAutostart ? "default" : "outline"}
                size="sm" 
                className="h-7"
                onClick={toggleSettings}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Settings</span>
              </Button>
              
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
          </div>
          
          {/* Settings & Diagnostic Panels - Show when specifically requested */}
          {(showDiagnostics || debugMode) && <div className="mt-2"><DiagnosticPanel /></div>}
          {showAutostart && <div className="mt-2"><AutostartConfig /></div>}
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
