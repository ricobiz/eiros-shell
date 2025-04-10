import React, { createContext, useContext } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState(localStorage.getItem('language') || 'en');

  React.useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Обновляем словарь translations
  const translations = {
    en: {
      shell: 'Shell',
      command: 'Command',
      vision: 'Vision',
      memory: 'Memory',
      chat: 'Chat',
      browser: 'Browser',
      instructions: 'Instructions',
      loading: 'Loading...',
      sendMessage: 'Send a message',
      typeCommandHere: 'Type a command here',
      execute: 'Execute',
      screenshot: 'Take Screenshot',
      analyze: 'Analyze UI',
      clearLogs: 'Clear Logs',
      connect: 'Connect',
      disconnect: 'Disconnect',
      aiConnectedToast: 'AI Connected',
      aiDisconnected: 'AI Disconnected',
      shellConnected: 'Shell connected to AI system',
      shellDisconnected: 'Shell disconnected from AI system',
      connectionError: 'Connection Error',
      connectionErrorDesc: 'Could not establish connection to AI system',
      emergencyStop: 'Emergency Stop',
      emergencyStopTitle: 'Emergency Stop Activated',
      emergencyStopDesc: 'All AI operations have been halted',
      pinWindow: 'Pin Window',
      unpinWindow: 'Unpin Window',
      pinned: 'Pinned',
      active: 'Active',
      aiConnected: 'AI Connected',
      listening: 'Listening',
      open: 'Open',
      stop: 'Stop',
      pause: 'Paused',
      pauseExecution: 'Pause Execution',
      resumeExecution: 'Resume Execution',
      expandInterface: 'Expand Interface',
      collapseInterface: 'Collapse Interface',
    },
    ru: {
      shell: 'Оболочка',
      command: 'Команда',
      vision: 'Зрение',
      memory: 'Память',
      chat: 'Чат',
      browser: 'Браузер',
      instructions: 'Инструкции',
      loading: 'Загрузка...',
      sendMessage: 'Отправить сообщение',
      typeCommandHere: 'Введите команду здесь',
      execute: 'Выполнить',
      screenshot: 'Сделать снимок',
      analyze: 'Анализ интерфейса',
      clearLogs: 'Очистить логи',
      connect: 'Подключить',
      disconnect: 'Отключить',
      aiConnectedToast: 'ИИ подключен',
      aiDisconnected: 'ИИ отключен',
      shellConnected: 'Оболочка подключена к системе ИИ',
      shellDisconnected: 'Оболочка отключена от системы ИИ',
      connectionError: 'Ошибка соединения',
      connectionErrorDesc: 'Не удалось установить соединение с системой ИИ',
      emergencyStop: 'Экстренная остановка',
      emergencyStopTitle: 'Активирована экстренная остановка',
      emergencyStopDesc: 'Все операции ИИ были остановлены',
      pinWindow: 'Закрепить окно',
      unpinWindow: 'Открепить окно',
      pinned: 'Закреплено',
      active: 'Активно',
      aiConnected: 'ИИ подключен',
      listening: 'Прослушивание',
      open: 'Открыть',
      stop: 'Стоп',
      pause: 'Пауза',
      pauseExecution: 'Приостановить выполнение',
      resumeExecution: 'Возобновить выполнение',
      expandInterface: 'Развернуть интерфейс',
      collapseInterface: 'Свернуть интерфейс',
    }
  };

  const t = (key: string) => {
    return translations[language as keyof typeof translations][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
