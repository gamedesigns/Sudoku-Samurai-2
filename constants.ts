import { CellValue, Difficulty, GameConfig, GameMode, GridSize } from './types';
import { PUZZLES } from './puzzles';

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