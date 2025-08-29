export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Position = [number, number];

export type Cell = {
  value: CellValue;
  notes: Set<number>;
  isOriginal: boolean;
};

export type Grid = Cell[][];

export type Difficulty = 'Novice' | 'Easy' | 'Medium' | 'Hard';
export type Language = 'en' | 'cs' | 'de';

export type GameMode = 'Classic' | 'X-Sudoku';
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

export type SoundEvent = 'placeNumber' | 'delete' | 'error' | 'click';

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
}

export interface Theme {
  bg: string;
  text: string;
  cardBg: string;
  cellBg: string;
  cellEmpty: string;
  cellSelected: string;
  cellHighlight: string;
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
}