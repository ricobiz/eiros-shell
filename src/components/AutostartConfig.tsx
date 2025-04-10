
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Laptop, RotateCw } from 'lucide-react';
import { diagnosticsService } from '@/services/DiagnosticsService';

const AutostartConfig: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAutostart = async () => {
      try {
        const enabled = await diagnosticsService.isAutostartEnabled();
        setIsEnabled(enabled);
      } catch (error) {
        console.error("Failed to check autostart status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAutostart();
  }, []);
  
  const handleToggleAutostart = async () => {
    setIsLoading(true);
    
    try {
      const result = await diagnosticsService.configureAutostart(!isEnabled);
      
      if (result) {
        setIsEnabled(!isEnabled);
        toast({
          title: "Autostart Updated",
          description: `Autostart has been ${!isEnabled ? 'enabled' : 'disabled'}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Could not update autostart configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to toggle autostart:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating autostart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Autostart Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autostart-toggle">
                Launch at system startup
              </Label>
              <p className="text-[11px] text-muted-foreground">
                EirosShell will automatically start when your computer boots
              </p>
            </div>
            <Switch 
              id="autostart-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggleAutostart}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="retry-toggle">
                Auto-reconnect
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Automatically retry connection up to 3 times if failed
              </p>
            </div>
            <Switch id="retry-toggle" checked={true} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center">
            <Laptop className="h-3 w-3 mr-1" />
            {isEnabled ? 'Enabled for this device' : 'Not enabled'}
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={isLoading}>
            {isLoading ? (
              <>
                <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              'Apply Changes'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutostartConfig;
