import { GameConfig, Language, AppSettings as AppSettingsType, ThemeName, SoundEvent, MusicProfile, Difficulty } from './types';

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
    musicProfile: 'Level',
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

export const MUSIC_PROFILES: MusicProfile[] = ['Calm', 'Powerful', 'Level', 'Mixed'];

// NOTE: Add paths to your actual audio files here.
// The system supports multiple files for SFX (randomly chosen) and playlists for music.
export const AUDIO_CONFIG: {
    music: {
        victory: string;
        profiles: {
            Calm: string[];
            Powerful: string[];
            Level: Record<Difficulty, string[]>;
        }
    },
    sfx: Record<SoundEvent, string[]>
} = {
    music: {
        victory: '', // e.g. '/audio/victory.mp3'
        profiles: {
            Calm: [], // e.g. ['/audio/music/calm1.mp3', '/audio/music/calm2.mp3']
            Powerful: [], // e.g. ['/audio/music/powerful1.mp3', '/audio/music/powerful2.mp3']
            Level: {
                Novice: [], // e.g. ['/audio/music/novice.mp3']
                Easy: [], // e.g. ['/audio/music/easy.mp3']
                Medium: [], // e.g. ['/audio/music/medium.mp3']
                Hard: [], // e.g. ['/audio/music/hard.mp3']
            }
        }
    },
    sfx: {
        placeNumber: [], // e.g. ['/audio/sfx/place1.wav', '/audio/sfx/place2.wav']
        delete: [], // e.g. ['/audio/sfx/delete.wav']
        error: [], // e.g. ['/audio/sfx/error.wav']
        click: [], // e.g. ['/audio/sfx/click1.wav', '/audio/sfx/click2.wav']
    }
};