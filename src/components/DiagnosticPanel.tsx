
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { diagnosticsService, DiagnosticResult } from '@/services/DiagnosticsService';

const DiagnosticPanel: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [summary, setSummary] = useState<string>('');
  
  useEffect(() => {
    // Run diagnostics on component mount
    const runDiagnostics = async () => {
      try {
        const results = await diagnosticsService.runAllDiagnostics();
        setDiagnosticResults(results.results);
        setSummary(results.summary);
        setOverallStatus(results.passed ? 'success' : 'error');
      } catch (error) {
        console.error('Failed to run diagnostics:', error);
        setOverallStatus('error');
        setSummary('❌ Failed to run system diagnostics');
      } finally {
        setIsRunning(false);
      }
    };
    
    runDiagnostics();
  }, []);
  
  const renderStatusSummary = () => {
    if (isRunning) {
      return (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Running system diagnostics...
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">System Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        {renderStatusSummary()}
        
        <div className="mt-4 space-y-2">
          {diagnosticResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span>{result.test}</span>
              <span className={result.passed ? "text-green-500" : "text-destructive"}>
                {result.passed ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
