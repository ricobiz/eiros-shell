import React, { createContext, useContext, useCallback } from 'react';

export type LanguageType = 'en' | 'ru';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
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
    documentation: 'Documentation',
    docs: 'Docs',
    downloadDocumentation: 'Download MD',
    downloading: 'Downloading...',
    docDownloadSuccess: 'Documentation Downloaded',
    docDownloadSuccessDesc: 'Shell documentation has been saved to your device',
    docDownloadError: 'Download Failed',
    docDownloadErrorDesc: 'Failed to download documentation',
    aiShellInterface: 'AI Shell Interface',
    shellDescription: 'This interface allows AI to interact with web browsers through structured commands and visual analysis.',
    basicCommands: 'Basic Commands',
    advancedFeatures: 'Advanced Features',
    patternRecognition: 'Pattern recognition and learning',
    memorySystem: 'Memory system for storing and retrieving information',
    uiAnnotation: 'UI element annotation and recognition',
    conditionalCommands: 'Conditional commands and logic',
    variableSupport: 'Variable support for complex operations',
    documentationNote: 'Note for AI',
    documentationNoteText: 'Download the complete documentation to keep in your memory for better assistance when working with this shell.'
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
    active: 'Активн��',
    aiConnected: 'ИИ подключен',
    listening: 'Прослушивание',
    open: 'Открыть',
    stop: 'Стоп',
    pause: 'Пауза',
    pauseExecution: 'Приостановить выполнение',
    resumeExecution: 'Возобновить выполнение',
    expandInterface: 'Развернуть интерфейс',
    collapseInterface: 'Свернуть интерфейс',
    documentation: 'Документация',
    docs: 'Документы',
    downloadDocumentation: 'Скачать MD',
    downloading: 'Загрузка...',
    docDownloadSuccess: 'Документация загружена',
    docDownloadSuccessDesc: 'Документация оболочки сохранена на ваше устройство',
    docDownloadError: 'Ошибка загрузки',
    docDownloadErrorDesc: 'Не удалось загрузить документацию',
    aiShellInterface: 'Интерфейс оболочки ИИ',
    shellDescription: 'Этот интерфейс позволяет ИИ взаимодействовать с веб-браузерами через структурированные команды и визуальный анализ.',
    basicCommands: 'Основные команды',
    advancedFeatures: 'Расширенные функции',
    patternRecognition: 'Распознавание и обучение шаблонам',
    memorySystem: 'Система памяти для хранения и извлечения информации',
    uiAnnotation: 'Аннотирование и распознавание элементов интерфейса',
    conditionalCommands: 'Условные команды и логика',
    variableSupport: 'Поддержка переменных для сложных операций',
    documentationNote: 'Примечание для ИИ',
    documentationNoteText: 'Загрузите полную документацию, чтобы сохранить её в памяти для лучшей помощи при работе с этой оболочкой.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState<LanguageType>((localStorage.getItem('language') as LanguageType) || 'en');

  React.useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = React.useCallback((key: string) => {
    return translations[language]?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
