
import { useState, useEffect } from 'react';
import { navigationEvents } from '@/services/commands/navigationCommand';

export function useShellTabs() {
  const [activeTab, setActiveTab] = useState('command');
  const [browserUrl, setBrowserUrl] = useState('https://example.com');

  useEffect(() => {
    const unsubscribe = navigationEvents.subscribe((url) => {
      setBrowserUrl(url);
      // Automatically switch to browser tab when navigation occurs
      setActiveTab('browser');
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    activeTab,
    setActiveTab,
    browserUrl,
    setBrowserUrl
  };
}
