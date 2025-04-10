
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RotateCw, ShieldAlert, Laptop, Clock, Wifi, Database } from 'lucide-react';
import DiagnosticPanel from '../DiagnosticPanel';
import AutostartConfig from '../AutostartConfig';
import { diagnosticsService } from '@/services/DiagnosticsService';

const SystemSettingsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [repairingBridge, setRepairingBridge] = useState(false);
  const { toast } = useToast();
  
  const handleRepairBridge = async () => {
    setRepairingBridge(true);
    
    try {
      const result = await diagnosticsService.repairEirosBridge();
      
      if (result) {
        toast({
          title: "Bridge Repaired",
          description: "Eiros Bridge file has been successfully repaired"
        });
      } else {
        toast({
          title: "Repair Failed",
          description: "Could not repair the Eiros Bridge file",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to repair bridge:", error);
      toast({
        title: "Repair Failed",
        description: "An error occurred during the repair process",
        variant: "destructive"
      });
    } finally {
      setRepairingBridge(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">System Settings</h2>
      
      <DiagnosticPanel />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="startup">Startup</TabsTrigger>
          <TabsTrigger value="bridge">Eiros Bridge</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" defaultValue="EirosShell" />
                <p className="text-xs text-muted-foreground">
                  Name used to identify this agent in logs and messages
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable detailed logging and debug overlay
                    </p>
                  </div>
                  <Switch id="debug-mode" defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="error-reporting">Error Reporting</Label>
                    <p className="text-xs text-muted-foreground">
                      Send anonymous error reports to improve system
                    </p>
                  </div>
                  <Switch id="error-reporting" defaultChecked={true} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Command Execution Delay (ms)</Label>
                <div className="flex items-center space-x-4">
                  <Slider defaultValue={[500]} max={2000} step={100} className="flex-1" />
                  <span className="text-sm w-10 text-right">500</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Delay between command executions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="startup" className="space-y-4">
          <AutostartConfig />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Admin Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Some features require administrative privileges to function properly:
              </p>
              
              <ul className="list-disc text-xs space-y-1 pl-5 text-muted-foreground">
                <li>System-wide keyboard shortcuts</li>
                <li>Reading protected screen elements</li>
                <li>Automated startup configuration</li>
              </ul>
              
              <Button variant="outline" size="sm">
                Restart with Admin Rights
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bridge" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Eiros Bridge Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">File Status:</div>
                  <div className="text-green-500">Valid</div>
                  
                  <div className="text-muted-foreground">Last Updated:</div>
                  <div>2 hours ago</div>
                  
                  <div className="text-muted-foreground">File Size:</div>
                  <div>24.3 KB</div>
                  
                  <div className="text-muted-foreground">Schema Version:</div>
                  <div>v2.1</div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleRepairBridge}
                  disabled={repairingBridge}
                >
                  {repairingBridge ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Repairing...
                    </>
                  ) : (
                    'Repair Bridge File'
                  )}
                </Button>
                
                <Button variant="outline" size="sm">
                  View Bridge Data
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                API Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input 
                    id="api-endpoint" 
                    defaultValue="https://api.eiros.dev/v1" 
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button size="sm">
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsTab;
