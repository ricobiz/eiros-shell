
import { logService } from '../LogService';
import { aiSyncEvents } from './events';
import { AIWindowManager } from './types';

export class AIConnectionService {
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_ATTEMPTS = 3;
  private readonly MAX_RECONNECT_INTERVAL = 30000; // 30 seconds
  private lastConnectionAttempt: number = 0;
  private readonly AI_URL = 'https://chat.openai.com/';
  private readonly COOLDOWN_PERIOD = 5000; // 5 second cooldown between connection attempts
  
  constructor(private windowManager: AIWindowManager) {}
  
  isConnected(): boolean {
    // Only check if window is still open if we think we're connected
    if (this.connected) {
      // Check if the window is still open
      if (!this.windowManager.isWindowOpen()) {
        this.connected = false;
        // Emit disconnection event
        aiSyncEvents.emit(false, 'Окно ChatGPT было закрыто');
        
        logService.addLog({
          type: 'warning',
          message: 'Соединение с ChatGPT потеряно (окно закрыто)',
          timestamp: Date.now()
        });
      }
    }
    return this.connected;
  }
  
  async connectToAI(): Promise<boolean> {
    // Prevent connection spam by enforcing a cooldown period
    const now = Date.now();
    if ((now - this.lastConnectionAttempt) < this.COOLDOWN_PERIOD) {
      logService.addLog({
        type: 'info',
        message: 'Попытка подключения отклонена. Пожалуйста, подождите несколько секунд перед повторной попыткой.',
        timestamp: Date.now()
      });
      return this.connected;
    }
    
    // If already connected and window is open, do nothing
    if (this.isConnected() && this.windowManager.isWindowOpen()) {
      logService.addLog({
        type: 'info',
        message: 'Уже подключено к AI',
        timestamp: Date.now()
      });
      return true;
    }
    
    this.lastConnectionAttempt = now;
    this.connectionAttempts++;
    
    try {
      // When connecting to browser-based ChatGPT, log the attempt
      logService.addLog({
        type: 'info',
        message: 'Открытие соединения с браузерным ChatGPT...',
        timestamp: Date.now()
      });
      
      // Open ChatGPT in a new window
      const chatWindow = this.windowManager.openWindow(this.AI_URL);
      
      if (!chatWindow) {
        throw new Error('Не удалось открыть окно ChatGPT. Возможно, блокировщик всплывающих окон активен.');
      }
      
      // Mark as connected since we successfully opened the window
      this.connected = true;
      this.connectionAttempts = 0;
      
      logService.addLog({
        type: 'success',
        message: 'Окно браузера ChatGPT открыто',
        timestamp: Date.now()
      });
      
      // Emit sync event
      aiSyncEvents.emit(true, 'Окно браузера ChatGPT открыто');
      
      // Focus the window
      this.windowManager.focusWindow();
      
      return true;
    } catch (error) {
      logService.addLog({
        type: 'error',
        message: `Ошибка подключения к AI (попытка ${this.connectionAttempts}/${this.MAX_ATTEMPTS})`,
        timestamp: Date.now(),
        details: error
      });
      
      if (this.connectionAttempts >= this.MAX_ATTEMPTS) {
        this.connectionAttempts = 0;
        logService.addLog({
          type: 'warning',
          message: 'Достигнуто максимальное количество попыток подключения. Повторная попытка через некоторое время.',
          timestamp: Date.now()
        });
      }
      
      // Emit sync event
      aiSyncEvents.emit(false, 'Ошибка подключения к AI');
      
      return false;
    }
  }
  
  disconnectFromAI(): void {
    if (!this.connected) {
      return;
    }
    
    // Close the window if it's open
    this.windowManager.closeWindow();
    
    this.connected = false;
    
    logService.addLog({
      type: 'info',
      message: 'Отключено от окна ChatGPT',
      timestamp: Date.now()
    });
    
    // Emit sync event
    aiSyncEvents.emit(false, 'Окно ChatGPT закрыто');
  }
}
