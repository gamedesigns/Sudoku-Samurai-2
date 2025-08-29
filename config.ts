import { GameConfig, Language, AppSettings as AppSettingsType, ThemeName } from './types';

export const DEFAULT_GAME_CONFIG: GameConfig = {
    size: 9,
    mode: 'Classic',
    difficulty: 'Easy',
};

// Re-exporting from types.ts to avoid circular dependencies
export interface AppSettings extends AppSettingsType {}

export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    highlightMode: true,
    language: 'en',
    mistakeChecker: true,
    gameConfig: DEFAULT_GAME_CONFIG,
    startFullscreen: true,
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