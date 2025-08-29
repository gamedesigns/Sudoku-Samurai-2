import { GameConfig, Language } from './types';

export const DEFAULT_GAME_CONFIG: GameConfig = {
    size: 9,
    mode: 'Classic',
    difficulty: 'Easy',
};

export interface AppSettings {
    darkMode: boolean;
    highlightMode: boolean;
    language: Language;
    mistakeChecker: boolean;
    gameConfig: GameConfig;
}

export const DEFAULT_SETTINGS: AppSettings = {
    darkMode: false,
    highlightMode: true,
    language: 'en',
    mistakeChecker: true,
    gameConfig: DEFAULT_GAME_CONFIG,
};

export const LANGUAGES: { code: Language; name: string }[] = [
    { code: 'en', name: 'EN' },
    { code: 'de', name: 'DE' },
    { code: 'cs', name: 'CS' },
];

export const GAME_MODES: { nameKey: string, mode: GameConfig['mode'], size: GameConfig['size'] }[] = [
    { nameKey: 'classic4x4', mode: 'Classic', size: 4 },
    { nameKey: 'classic6x6', mode: 'Classic', size: 6 },
    { nameKey: 'classic9x9', mode: 'Classic', size: 9 },
    { nameKey: 'xsudoku9x9', mode: 'X-Sudoku', size: 9 },
];
