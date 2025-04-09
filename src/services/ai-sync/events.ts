
// Event system for AI sync events
export const aiSyncEvents = {
  listeners: new Set<(connected: boolean, message?: string) => void>(),
  
  subscribe(callback: (connected: boolean, message?: string) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  emit(connected: boolean, message?: string) {
    this.listeners.forEach(callback => callback(connected, message));
  }
};
