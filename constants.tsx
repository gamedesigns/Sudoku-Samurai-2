import React from 'react';
import { CellValue, Difficulty, GameConfig, GameMode, GridSize } from './types.ts';
import { PUZZLES } from './puzzles/index.ts';

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
const geometricColors = [
  '#E74C3C', '#3498DB', '#F39C12', '#27AE60', '#9B59B6',
  '#E67E22', '#2ECC71', '#8E44AD', '#F1C40F'
];

const trafficColors = [
  '#C0392B', '#2980B9', '#F39C12', '#27AE60', '#8E44AD',
  '#D35400', '#16A085', '#7F8C8D', '#E74C3C'
];
export const KIDS_ICON_MAP: { [key: number]: React.FC<{ className?: string }> } = {
    1: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[0]}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
    2: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[1]}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
    3: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[2]}><circle cx="12" cy="12" r="5" /><path d="M12 1v2m9.9 7.9l-1.4 1.4M21 12h-2m-7.9 9.9l-1.4-1.4M12 21v-2m-7.9-9.9l1.4-1.4M3 12h2m7.9-9.9l1.4 1.4" /></svg>,
    4: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[3]}><path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z" /></svg>,
    5: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[4]}><path d="M12 2l8 6v12H4V8l8-6zm0 2.5L6 9v11h12V9l-6-4.5z" /></svg>,
    6: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={geometricColors[2]}><path d="M12 2l10 18H2L12 2z" /></svg>,
    7: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[6]}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
    8: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[7]}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>,
    9: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill={iconColors[8]}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>,
};
