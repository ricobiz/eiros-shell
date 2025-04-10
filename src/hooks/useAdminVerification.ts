
import { useState, useEffect } from 'react';
import { systemCommandService } from '@/services/SystemCommandService';
import { logService } from '@/services/LogService';

export function useAdminVerification() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [elevationRequested, setElevationRequested] = useState(false);
  
  useEffect(() => {
    const verifyAdminRights = async () => {
      try {
        setIsCheckingAdmin(true);
        const hasAdminRights = systemCommandService.hasAdminRights();
        setIsAdmin(hasAdminRights);
        
        if (!hasAdminRights) {
          logService.addLog({
            type: 'warning',
            message: 'Application is running without admin privileges, some features may be limited',
            timestamp: Date.now()
          });
        } else {
          logService.addLog({
            type: 'info',
            message: 'Application is running with admin privileges',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        logService.addLog({
          type: 'error',
          message: 'Error verifying admin rights',
          timestamp: Date.now(),
          details: error
        });
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    verifyAdminRights();
  }, []);
  
  const requestElevation = async (): Promise<boolean> => {
    try {
      setElevationRequested(true);
      const result = await systemCommandService.requestElevation();
      setIsAdmin(result);
      
      if (!result) {
        logService.addLog({
          type: 'warning',
          message: 'Elevation request was denied, some features will be limited',
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: 'Error requesting elevation',
        timestamp: Date.now(),
        details: error
      });
      return false;
    } finally {
      setElevationRequested(false);
    }
  };
  
  return {
    isAdmin,
    isCheckingAdmin,
    elevationRequested,
    requestElevation
  };
}
