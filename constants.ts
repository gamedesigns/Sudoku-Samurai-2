import React from 'react';
import { CellValue, Difficulty, GameConfig, GameMode, GridSize } from './types';
import { PUZZLES } from './puzzles';

export const hasPuzzles = (config: { mode: GameMode, size: GridSize, difficulty: Difficulty }): boolean => {
    if (config.mode === 'Duel') {
        const puzzleSet = PUZZLES['Duel']?.[config.size]?.[config.difficulty];
        return !!puzzleSet && puzzleSet.length > 0;
    }
    const puzzleSet = PUZZLES[config.mode]?.[config.size]?.[config.difficulty];
    return !!puzzleSet && puzzleSet.length > 0;
};

export const getRandomPuzzle = (config: GameConfig): CellValue[][] | null => {
    if (config.mode === 'Duel') {
        const puzzleSet = PUZZLES['Duel']?.[config.size]?.[config.difficulty];
        if (!puzzleSet || puzzleSet.length === 0) return null;
        return puzzleSet[Math.floor(Math.random() * puzzleSet.length)];
    }
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

export const LETTER_MAP: { [key: number]: string } = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'I',
};

export const JAPANESE_NUMBER_MAP: { [key: number]: string } = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
};

const iconColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];

// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const KIDS_ICON_MAP: { [key: number]: React.FC<{ className?: string }> } = {
    1: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[0] }, React.createElement('path', { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" })),
    2: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[1] }, React.createElement('path', { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" })),
    3: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[2] }, React.createElement('circle', { cx: "12", cy: "12", r: "5" }), React.createElement('path', { d: "M12 1v2m9.9 7.9l-1.4 1.4M21 12h-2m-7.9 9.9l-1.4-1.4M12 21v-2m-7.9-9.9l1.4-1.4M3 12h2m7.9-9.9l1.4 1.4" })),
    4: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[3] }, React.createElement('path', { d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" })),
    5: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[4] }, React.createElement('path', { d: "M13 2H6v6h7v10h2V8h1V2h-3zM6 16h2v6H6v-6z" })),
    6: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[5] }, React.createElement('path', { d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.83 0-1 .17-1 .5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" })),
    7: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[6] }, React.createElement('path', { d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" })),
    8: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[7] }, React.createElement('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" })),
    9: ({ className }) => React.createElement('svg', { className, viewBox: "0 0 24 24", fill: iconColors[8] }, React.createElement('path', { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" })),
};