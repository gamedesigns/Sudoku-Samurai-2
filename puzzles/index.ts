import { CellValue, Difficulty, GameMode, GridSize } from '../types.ts';
import { CLASSIC_4X4_PUZZLES } from './classic4x4.ts';
import { CLASSIC_6X6_PUZZLES } from './classic6x6.ts';
import { CLASSIC_9X9_PUZZLES } from './classic9x9.ts';
import { X_SUDOKU_9X9_PUZZLES } from './xsudoku9x9.ts';
import { HYPER_SUDOKU_9X9_PUZZLES } from './hypersudoku9x9.ts';
import { MULTIPLAYER_6X6_PUZZLES } from './multiplayer6x6.ts';
import { MULTIPLAYER_9X9_PUZZLES } from './multiplayer9x9.ts';

type PuzzleCollection = Partial<Record<GameMode, Partial<Record<GridSize, Partial<Record<Difficulty, CellValue[][][]>>>>>;

export const PUZZLES: PuzzleCollection = {
    'Classic': {
        4: CLASSIC_4X4_PUZZLES,
        6: CLASSIC_6X6_PUZZLES,
        9: CLASSIC_9X9_PUZZLES,
    },
    'X-Sudoku': {
        9: X_SUDOKU_9X9_PUZZLES
    },
    'Hyper Sudoku': {
        9: HYPER_SUDOKU_9X9_PUZZLES
    },
    'Duel': {
        6: MULTIPLAYER_6X6_PUZZLES,
        9: MULTIPLAYER_9X9_PUZZLES,
    }
};