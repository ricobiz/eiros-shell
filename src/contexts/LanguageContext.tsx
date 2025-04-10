
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'ru';

// Define translation structure
type Translations = {
  [key: string]: {
    en: string;
    ru: string;
  };
};

// All UI translations
const translations: Translations = {
  // Shell header
  shell: { en: "Shell", ru: "Оболочка" },
  disconnect: { en: "Disconnect", ru: "Отключить" },
  connect: { en: "Connect", ru: "Подключить" },
  stop: { en: "Stop", ru: "Стоп" },
  emergencyStop: { en: "Emergency stop", ru: "Аварийная остановка" },
  pinWindow: { en: "Pin window", ru: "Закрепить окно" },
  unpinWindow: { en: "Unpin window", ru: "Открепить окно" },
  
  // Tabs
  command: { en: "Command", ru: "Команды" },
  vision: { en: "Vision", ru: "Зрение" },
  memory: { en: "Memory", ru: "Память" },
  chat: { en: "Chat", ru: "Чат" },
  browser: { en: "Browser", ru: "Браузер" },
  instructions: { en: "Instructions", ru: "Инструкции" },
  
  // Emergency pause/resume
  pause: { en: "Pause", ru: "Пауза" },
  resume: { en: "Resume", ru: "Продолжить" },
  
  // Task scheduling
  schedule: { en: "Schedule", ru: "Расписание" },
  scheduleTask: { en: "Schedule Task", ru: "Запланировать задачу" },
  interval: { en: "Interval (seconds)", ru: "Интервал (секунды)" },
  message: { en: "Message", ru: "Сообщение" },
  add: { en: "Add", ru: "Добавить" },
  delete: { en: "Delete", ru: "Удалить" },
  scheduledTasks: { en: "Scheduled Tasks", ru: "Запланированные задачи" },
  
  // Footer
  pinned: { en: "Pinned", ru: "Закреплено" },
  active: { en: "Active", ru: "Активно" },
  aiConnected: { en: "AI Connected", ru: "ИИ Подключен" },
  listening: { en: "Listening", ru: "Прослушивание" },
  
  // Toast messages
  aiDisconnected: { en: "AI disconnected", ru: "ИИ отключен" },
  shellDisconnected: { en: "Shell disconnected from AI", ru: "Оболочка отключена от ИИ" },
  aiConnectedToast: { en: "AI connected", ru: "ИИ подключен" },
  shellConnected: { en: "Shell successfully connected to AI", ru: "Оболочка успешно подключена к ИИ" },
  connectionError: { en: "Connection error", ru: "Ошибка подключения" },
  connectionErrorDesc: { en: "Failed to connect to AI. Try again.", ru: "Не удалось подключиться к ИИ. Попробуйте снова." },
  emergencyStopTitle: { en: "Emergency stop", ru: "Аварийная остановка" },
  emergencyStopDesc: { en: "All AI connections stopped", ru: "Все подключения к ИИ остановлены" },
  taskScheduled: { en: "Task scheduled", ru: "Задача запланирована" },
  taskDeleted: { en: "Task deleted", ru: "Задача удалена" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'en';
  });

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
