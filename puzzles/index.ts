import { CellValue, Difficulty, GameMode, GridSize } from '../types';
import { CLASSIC_4X4_PUZZLES } from './classic4x4';
import { CLASSIC_6X6_PUZZLES } from './classic6x6';
import { CLASSIC_9X9_PUZZLES } from './classic9x9';
import { X_SUDOKU_9X9_PUZZLES } from './xsudoku9x9';

type PuzzleCollection = Record<GameMode, Partial<Record<GridSize, Partial<Record<Difficulty, CellValue[][][]>>>>>;

export const PUZZLES: PuzzleCollection = {
    'Classic': {
        4: CLASSIC_4X4_PUZZLES,
        6: CLASSIC_6X6_PUZZLES,
        9: CLASSIC_9X9_PUZZLES,
    },
    'X-Sudoku': {
        9: X_SUDOKU_9X9_PUZZLES
    }
};
