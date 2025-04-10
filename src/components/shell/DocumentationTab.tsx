
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { documentationService } from '@/services/DocumentationService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const DocumentationTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleDownloadDocs = () => {
    setIsLoading(true);
    
    try {
      const markdown = documentationService.generateMarkdownDocumentation();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eiros-shell-documentation.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: t('docDownloadSuccess'),
        description: t('docDownloadSuccessDesc')
      });
    } catch (error) {
      console.error('Error generating documentation:', error);
      toast({
        title: t('docDownloadError'),
        description: t('docDownloadErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('documentation')}</h3>
        <Button 
          onClick={handleDownloadDocs} 
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? t('downloading') : t('downloadDocumentation')}
        </Button>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-6">
          <section>
            <h3 className="font-medium text-lg mb-2">{t('aiShellInterface')}</h3>
            <p className="text-muted-foreground">
              {t('shellDescription')}
            </p>
          </section>
          
          <section>
            <h3 className="font-medium text-lg mb-2">{t('basicCommands')}</h3>
            <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
              /click#elementID{'\{'}selector: ".button", waitAfter: 1000{'\}'}<br/>
              /type#inputField{'\{'}selector: "#search", text: "query", waitAfter: 500{'\}'}<br/>
              /navigate#goToPage{'\{'}url: "https://example.com"{'\}'}<br/>
              /screenshot#capture{'\{'}{'}'}<br/>
              /analyze#pageStructure{'\{'}{'}'}<br/>
            </pre>
          </section>
          
          <section>
            <h3 className="font-medium text-lg mb-2">{t('advancedFeatures')}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t('patternRecognition')}</li>
              <li>{t('memorySystem')}</li>
              <li>{t('uiAnnotation')}</li>
              <li>{t('conditionalCommands')}</li>
              <li>{t('variableSupport')}</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-medium text-lg mb-2">{t('documentationNote')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('documentationNoteText')}
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentationTab;
