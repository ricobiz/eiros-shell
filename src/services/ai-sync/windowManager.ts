
/**
 * Window manager for handling ChatGPT browser windows
 */
export class WindowManager implements AIWindowManager {
  private chatWindow: Window | null = null;
  private readonly WINDOW_NAME = 'ChatGPTWindow';
  private readonly DEFAULT_FEATURES = 'width=800,height=600,resizable=yes,scrollbars=yes';

  openWindow(url: string, options?: AIConnectionOptions): Window | null {
    const windowName = options?.windowName || this.WINDOW_NAME;
    const windowFeatures = options?.windowFeatures || this.DEFAULT_FEATURES;

    try {
      this.chatWindow = window.open(url, windowName, windowFeatures);
      return this.chatWindow;
    } catch (error) {
      console.error('Failed to open chat window:', error);
      return null;
    }
  }

  closeWindow(): void {
    if (this.chatWindow && !this.chatWindow.closed) {
      this.chatWindow.close();
    }
    this.chatWindow = null;
  }

  isWindowOpen(): boolean {
    return this.chatWindow !== null && !this.chatWindow.closed;
  }

  focusWindow(): boolean {
    if (this.isWindowOpen() && this.chatWindow) {
      this.chatWindow.focus();
      return true;
    }
    return false;
  }
}

export const windowManager = new WindowManager();

