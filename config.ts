import { GameConfig, Language, AppSettings as AppSettingsType, ThemeName, SoundEvent } from './types';

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
    musicVolume: 0.3,
    sfxVolume: 0.6,
    isMuted: false,
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

export const AUDIO_CONFIG: {
    music: {
        background: string;
        victory: string;
    },
    sfx: Record<SoundEvent, string>
} = {
    music: {
        // NOTE: Replace with actual paths to your audio files
        background: '', // e.g. '/audio/background-music.mp3'
        victory: '', // e.g. '/audio/victory-fanfare.mp3'
    },
    sfx: {
        // NOTE: Replace with actual paths to your audio files
        placeNumber: '', // e.g. '/audio/place.wav'
        delete: '', // e.g. '/audio/delete.wav'
        error: '', // e.g. '/audio/error.wav'
        click: '', // e.g. '/audio/click.wav'
    }
};