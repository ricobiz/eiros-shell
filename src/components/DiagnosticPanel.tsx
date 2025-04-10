
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Shield, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { diagnosticsService, DiagnosticResult } from '@/services/DiagnosticsService';
import { useToast } from '@/hooks/use-toast';

const DiagnosticPanel: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [summary, setSummary] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [hasAdminRights, setHasAdminRights] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const runDiagnostics = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      const results = await diagnosticsService.runAllDiagnostics();
      clearInterval(progressInterval);
      setProgress(100);
      
      setDiagnosticResults(results.results);
      setSummary(results.summary);
      setOverallStatus(results.passed ? 'success' : 'error');
      
      // Check for admin rights in results
      const adminCheck = results.results.find(r => r.test === 'Admin Rights');
      if (adminCheck) {
        setHasAdminRights(adminCheck.passed && adminCheck.message.includes('Has admin rights'));
      }
      
      // Show toast notification
      if (results.passed) {
        toast({
          title: "System Check Complete",
          description: "All systems operational ✅",
        });
      } else {
        toast({
          title: "System Check Issues",
          description: "Some components are not functioning properly ❌",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
      setOverallStatus('error');
      setSummary('❌ Failed to run system diagnostics');
      toast({
        title: "Diagnostics Error",
        description: "Could not complete system checks",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  useEffect(() => {
    // Run diagnostics on component mount
    runDiagnostics();
  }, []);
  
  const handleRestartAsAdmin = () => {
    // In a real implementation, this would trigger a UAC elevation
    toast({
      title: "Elevation Request",
      description: "Attempting to restart with admin privileges...",
    });
    
    // This would be handled by the backend - simulating for now
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  const renderStatusSummary = () => {
    if (isRunning) {
      return (
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Running system diagnostics...
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      );
    }
    
    if (overallStatus === 'success') {
      return (
        <Alert variant="default" className="bg-green-500/10 border-green-500/50 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="ml-2">System Ready</AlertTitle>
          <AlertDescription className="ml-2">
            {summary}
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="ml-2">System Issues Detected</AlertTitle>
        <AlertDescription className="ml-2">
          {summary}
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">System Diagnostics</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runDiagnostics}
            disabled={isRunning}
            className="h-7 px-2"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1" />
            <span>Recheck</span>
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Verifying system integrity and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-3">
        {renderStatusSummary()}
        
        <div className="space-y-2">
          {diagnosticResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span>{result.test}</span>
              <span className={result.passed ? "text-green-500" : "text-destructive"}>
                {result.passed ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
        
        {hasAdminRights === false && (
          <div className="pt-1">
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/50">
              <Shield className="h-4 w-4 text-amber-500" />
              <AlertTitle className="ml-2 text-xs text-amber-500">Limited Permissions</AlertTitle>
              <div className="flex items-center justify-between w-full">
                <AlertDescription className="ml-2 text-xs text-amber-500/90">
                  Some features require admin rights
                </AlertDescription>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs border-amber-500/50 text-amber-500"
                  onClick={handleRestartAsAdmin}
                >
                  Restart as Admin
                </Button>
              </div>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
