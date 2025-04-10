
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellContent from './shell/ShellContent';
import ShellHeader from './shell/ShellHeader';
import ShellFooter from './shell/ShellFooter';
import TabNavigation from './shell/TabNavigation';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { LanguageProvider } from '@/contexts/LanguageContext';
import DiagnosticPanel from './DiagnosticPanel';
import DebugOverlay from './DebugOverlay';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Bug, CheckCircle } from 'lucide-react';

// Separate the ShellContainer into its own component file
import ShellContainer from './shell/ShellContainer';

const ShellInterface: React.FC = () => {
  return (
    <LanguageProvider>
      <ShellProvider>
        <ShellContainer />
      </ShellProvider>
    </LanguageProvider>
  );
};

export default ShellInterface;
