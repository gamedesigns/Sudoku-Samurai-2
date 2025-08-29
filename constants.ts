import { CellValue, Difficulty, GameConfig, GameMode, GridSize } from './types';

// PUZZLE STRUCTURE:
// Record<GameMode, Record<GridSize, Record<Difficulty, Puzzles>>>
// Not all combinations will exist.

const CLASSIC_9x9_PUZZLES: Record<Difficulty, CellValue[][][]> = {
  Novice: [
    [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [0,4,5,2,8,0,1,7,0]
    ],
  ],
  Easy: [
    [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
  ],
  Medium: [
    [
      [0,2,0,6,0,8,0,0,0],
      [5,8,0,0,0,9,7,0,0],
      [0,0,0,0,4,0,0,0,0],
      [3,7,0,0,0,0,5,0,0],
      [6,0,0,0,0,0,0,0,4],
      [0,0,8,0,0,0,0,1,3],
      [0,0,0,0,2,0,0,0,0],
      [0,0,9,8,0,0,0,3,6],
      [0,0,0,3,0,6,0,9,0]
    ],
  ],
  Hard: [
    [
      [8,0,0,0,0,0,0,0,0],
      [0,0,3,6,0,0,0,0,0],
      [0,7,0,0,9,0,2,0,0],
      [0,5,0,0,0,7,0,0,0],
      [0,0,0,0,4,5,7,0,0],
      [0,0,0,1,0,0,0,3,0],
      [0,0,1,0,0,0,0,6,8],
      [0,0,8,5,0,0,0,1,0],
      [0,9,0,0,0,0,4,0,0]
    ],
  ]
};

// FIX: Changed type to Partial<Record<Difficulty, ...>> to allow for missing difficulties.
const CLASSIC_6x6_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Easy: [
        [
            [0,0,3,0,1,0],
            [0,1,0,0,0,4],
            [3,0,0,6,0,0],
            [0,0,5,0,0,1],
            [1,0,0,0,4,0],
            [0,6,0,2,0,0]
        ]
    ],
    Medium: [
        [
            [0,0,0,0,1,2],
            [0,0,0,5,0,0],
            [1,5,0,0,0,4],
            [4,0,0,0,5,6],
            [0,0,6,0,0,0],
            [5,4,0,0,0,0]
        ]
    ]
};

// FIX: Changed type to Partial<Record<Difficulty, ...>> to allow for missing difficulties.
const CLASSIC_4x4_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Easy: [
        [
            [0,2,0,0],
            [1,0,2,0],
            [0,1,0,3],
            [0,0,4,0]
        ]
    ]
};


// FIX: Changed type to Partial<Record<Difficulty, ...>> to allow for missing difficulties.
const X_SUDOKU_9x9_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Easy: [
        [
            [0,0,0,8,0,0,0,5,0],
            [0,8,0,0,0,1,0,0,0],
            [4,0,0,0,9,0,0,0,1],
            [0,0,0,0,0,4,0,1,0],
            [1,0,0,3,0,5,0,0,6],
            [0,3,0,1,0,0,0,0,0],
            [6,0,0,0,2,0,0,0,7],
            [0,0,0,9,0,0,0,6,0],
            [0,1,0,0,0,6,0,0,0]
        ]
    ],
    Medium: [
        [
            [0,8,0,0,0,0,0,0,0],
            [0,0,0,0,0,4,0,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,3,0,0,0,0,0,0],
            [9,0,0,0,0,0,0,0,2],
            [0,0,0,0,0,0,5,0,0],
            [0,0,0,0,0,5,0,0,0],
            [0,0,0,6,0,0,0,0,0],
            [0,0,0,0,0,0,0,7,0]
        ]
    ]
};

type PuzzleCollection = Record<GameMode, Partial<Record<GridSize, Partial<Record<Difficulty, CellValue[][][]>>>>>;

export const PUZZLES: PuzzleCollection = {
    'Classic': {
        4: CLASSIC_4x4_PUZZLES,
        6: CLASSIC_6x6_PUZZLES,
        9: CLASSIC_9x9_PUZZLES,
    },
    'X-Sudoku': {
        9: X_SUDOKU_9x9_PUZZLES
    }
};

export const hasPuzzles = (config: { mode: GameMode, size: GridSize, difficulty: Difficulty }): boolean => {
    const puzzleSet = PUZZLES[config.mode]?.[config.size]?.[config.difficulty];
    return !!puzzleSet && puzzleSet.length > 0;
};

export const getRandomPuzzle = (config: GameConfig): CellValue[][] | null => {
    const puzzleSet = PUZZLES[config.mode]?.[config.size]?.[config.difficulty];
    if (!puzzleSet || puzzleSet.length === 0) {
        return null;
    }
    return puzzleSet[Math.floor(Math.random() * puzzleSet.length)];
};

export const COLOR_MAP: { [key: number]: string } = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-lime-500',
    5: 'bg-green-500',
    6: 'bg-cyan-500',
    7: 'bg-blue-500',
    8: 'bg-indigo-500',
    9: 'bg-purple-500',
};