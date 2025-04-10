
import React from 'react';
import { ShellProvider } from '@/contexts/shell/ShellContext';
import ShellContainer from './shell/ShellContainer';
import { LanguageProvider } from '@/contexts/LanguageContext';

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
