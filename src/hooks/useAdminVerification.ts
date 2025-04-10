
import { useState, useCallback } from 'react';
import { systemCommandService } from '@/services/SystemCommandService';
import { toast } from 'sonner';

/**
 * Hook for handling admin verification and elevation
 */
export const useAdminVerification = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  /**
   * Check if the current process has admin rights
   */
  const checkAdminStatus = useCallback(async () => {
    try {
      const hasAdmin = systemCommandService.hasAdminRights();
      setIsAdmin(hasAdmin);
      return hasAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  /**
   * Request elevation of privileges
   */
  const requestElevation = useCallback(async (): Promise<boolean> => {
    try {
      setIsVerifying(true);
      
      toast.info('Requesting administrative privileges...');
      
      // Request elevation
      const result = await systemCommandService.requestElevation();
      
      if (result) {
        setIsAdmin(true);
        toast.success('Administrative privileges granted');
      } else {
        toast.error('Failed to get administrative privileges');
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting elevation:', error);
      toast.error('Error requesting administrative privileges');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    isAdmin,
    isVerifying,
    checkAdminStatus,
    requestElevation
  };
};
