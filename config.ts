import { Language } from './types';

export interface AppSettings {
    darkMode: boolean;
    highlightMode: boolean;
    language: Language;
    mistakeChecker: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
    darkMode: false,
    highlightMode: true,
    language: 'en',
    mistakeChecker: true,
};

export const LANGUAGES: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' },
    { code: 'de', name: 'DE' },
    { code: 'cs', name: 'CS' },
];