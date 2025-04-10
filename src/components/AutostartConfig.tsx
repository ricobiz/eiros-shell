
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Power, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { diagnosticsService } from '@/services/DiagnosticsService';
import { useToast } from '@/hooks/use-toast';

const AutostartConfig: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminRights, setHasAdminRights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if autostart is enabled
        const status = await diagnosticsService.isAutostartEnabled();
        setIsEnabled(status);
        
        // In a real implementation, this would also check if we have admin rights
        // For now, we'll simulate it
        setHasAdminRights(true);
      } catch (error) {
        console.error('Failed to check autostart status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const success = await diagnosticsService.configureAutostart(checked);
      
      if (success) {
        setIsEnabled(checked);
        toast({
          title: checked ? "Autostart Enabled" : "Autostart Disabled",
          description: checked 
            ? "EirosShell will start automatically on system boot" 
            : "EirosShell will not start automatically on system boot",
        });
      } else {
        throw new Error("Failed to configure autostart");
      }
    } catch (error) {
      console.error('Failed to configure autostart:', error);
      toast({
        title: "Configuration Failed",
        description: "Could not update autostart settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Power className="h-5 w-5 mr-2" />
          Autostart Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="font-medium">Start on system boot</p>
            <p className="text-sm text-muted-foreground">
              EirosShell will launch automatically when your system starts
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || !hasAdminRights}
          />
        </div>
        
        {!hasAdminRights && (
          <Alert className="mt-3 bg-amber-500/10 border-amber-500/50">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-500">
              Admin rights are required to configure autostart settings
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          <span>
            {hasAdminRights 
              ? "You have permission to modify system settings" 
              : "Elevated permissions needed for this feature"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutostartConfig;
