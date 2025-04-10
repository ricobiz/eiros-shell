
import React from 'react';
import { Button } from '@/components/ui/button';
import { Language, useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 w-12"
      onClick={toggleLanguage}
    >
      {language.toUpperCase()}
    </Button>
  );
};

export default LanguageSelector;
