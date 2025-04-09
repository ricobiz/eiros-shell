
export interface AIConnectionOptions {
  windowName?: string;
  windowFeatures?: string;
  autoReconnect?: boolean;
}

export interface AIWindowManager {
  openWindow(url: string, options?: AIConnectionOptions): Window | null;
  closeWindow(): void;
  isWindowOpen(): boolean;
  focusWindow(): boolean;
}
