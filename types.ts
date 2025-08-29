export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Position = [number, number];

export type Cell = {
  value: CellValue;
  notes: Set<number>;
  isOriginal: boolean;
  placedBy?: PlayerColor | null; // Added for Duel Mode
};

export type Grid = Cell[][];

export type Difficulty = 'Novice' | 'Easy' | 'Medium' | 'Hard';
export type Language = 'en' | 'cs' | 'de';

export type GameMode = 'Classic' | 'X-Sudoku' | 'Hyper Sudoku' | 'Duel';
export type GridSize = 4 | 6 | 9;

export interface GameConfig {
    size: GridSize;
    mode: GameMode;
    difficulty: Difficulty;
}

export type HintTechnique = 'Naked Single' | 'Hidden Single';

export type Hint = {
    position: Position;
    technique: HintTechnique;
    stage: 'nudge' | 'tutor' | 'reveal';
} | null;

export type ThemeName = 'light' | 'warm' | 'dark';

export type DisplayMode = 'number' | 'color' | 'letter' | 'japanese' | 'kids';

export type SoundEvent = 'placeNumber' | 'delete' | 'error' | 'click';

export type MusicProfile = 'Calm' | 'Powerful' | 'Level' | 'Mixed';

// --- Multiplayer Types ---
export type PlayerColor = 'red' | 'blue' | 'green' | 'violet';
export interface Player {
    id: number;
    nameKey: string;
    color: PlayerColor;
    score: number;
}
export interface MultiplayerConfig {
    playerCount: 2 | 3 | 4;
    puzzleSize: 6 | 9;
    difficulty: Difficulty;
    players: Player[];
    masterTimer: number; // in seconds
    turnTimer: number; // in seconds
}

export interface DuelState {
    players: Player[];
    currentPlayerIndex: number;
    masterTimeLeft: number;
    turnTimeLeft: number;
    isPaused: boolean;
    winner: Player | null;
}
// --- End Multiplayer Types ---


export interface AppSettings {
    theme: ThemeName;
    highlightMode: boolean;
    language: Language;
    mistakeChecker: boolean;
    gameConfig: GameConfig;
    startFullscreen: boolean;
    musicVolume: number;
    sfxVolume: number;
    isMuted: boolean;
    musicProfile: MusicProfile;
    phistomefelRing: boolean;
    displayMode: DisplayMode;
    swooshInput: boolean;
}

export interface Theme {
  bg: string;
  text: string;
  cardBg: string;
  cellBg: string;
  cellEmpty: string;
  cellSelected: string;
  cellHighlight: string;
  cellDragTarget: string;
  cellBeingMoved: string;
  border: string;
  borderThick: string;
  button: string;
  numberButton: string;
  modal: string;
  originalText: string;
  userText: string;
  toggleBg: string;
  toggleBgActive: string;
  noteText: string;
  cellErrorBg: string;
  cellErrorText: string;
  cellHintBorder: string;
  tutorBg: string;
  phistoRingCornerBg: string;
  phistoRingCenterBg: string;
  progressBg: string;
}