
/**
 * Types for the AI integration services
 */

export interface AIWindowManager {
  openWindow(url: string, options?: AIConnectionOptions): Window | null;
  closeWindow(): void;
  isWindowOpen(): boolean;
  focusWindow(): boolean;
  getWindow(): Window | null; // Add the missing method
}

export interface AIConnectionOptions {
  windowName?: string;
  windowFeatures?: string;
}

export enum AIConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  ERROR = 'error'
}
