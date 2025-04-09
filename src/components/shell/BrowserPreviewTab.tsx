
import React from 'react';
import { Button } from '@/components/ui/button';

interface BrowserPreviewTabProps {
  url: string;
  setUrl: (url: string) => void;
}

const BrowserPreviewTab: React.FC<BrowserPreviewTabProps> = ({ url, setUrl }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const handleNavigate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUrl = formData.get('url') as string;
    if (newUrl) {
      setUrl(newUrl);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleNavigate} className="flex gap-2">
        <input 
          name="url" 
          type="text" 
          className="flex-1 border rounded px-3 py-1 text-sm" 
          placeholder="Enter URL to preview"
          defaultValue={url || "https://example.com"} 
        />
        <Button type="submit" variant="outline" size="sm">Navigate</Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </form>
      
      <div className={`border rounded overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'h-[300px]'}`}>
        {url ? (
          <iframe 
            src={url} 
            className="w-full h-full border-0" 
            title="Browser Preview"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Enter a URL to preview web content
          </div>
        )}
      </div>
      
      {isFullscreen && (
        <Button 
          className="fixed top-4 right-4 z-50"
          onClick={() => setIsFullscreen(false)}
        >
          Close
        </Button>
      )}
    </div>
  );
};

export default BrowserPreviewTab;
