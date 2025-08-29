
import React, { useState, useEffect, useCallback } from 'react';
import { CellValue, Position, Grid, AppSettings, DuelState } from '../types.ts';
import { audioManager } from '../audio/AudioManager.ts';

type PlaceNumberFn = (row: number, col: number, num: CellValue, grid: Grid, duelState: DuelState | null, setDuelState: React.Dispatch<React.SetStateAction<DuelState | null>>) => Grid;
type CheckMistakesFn = (grid: Grid, playSound: boolean, isDuel: boolean) => void;

export const useDragAndDrop = (
    grid: Grid | null,
    setGrid: React.Dispatch<React.SetStateAction<Grid | null>>,
    settings: AppSettings,
    placeNumber: PlaceNumberFn,
    checkMistakes: CheckMistakesFn,
    inputMode: 'normal' | 'notes',
    selectedCell: Position | null,
    duelState: DuelState | null,
    setDuelState: React.Dispatch<React.SetStateAction<DuelState | null>>
) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [draggingNumber, setDraggingNumber] = useState<CellValue | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [dragTargetCell, setDragTargetCell] = useState<Position | null>(null);
    const [dragOriginCell, setDragOriginCell] = useState<Position | null>(null);

    const handleKeypadDragStart = useCallback((number: CellValue) => {
        if (!settings.swooshInput || inputMode === 'notes' || selectedCell) return;
        if (duelState?.isPaused) return;
        setIsDragging(true);
        setDraggingNumber(number);
        setDragOriginCell(null);
    }, [settings.swooshInput, inputMode, selectedCell, duelState]);

    const handleCellDragStart = useCallback((row: number, col: number) => {
        if (!settings.swooshInput || inputMode === 'notes' || !grid) return;
        if (duelState?.isPaused) return;

        const cell = grid[row][col];
        if (cell.isOriginal || cell.value === 0) return;

        if (duelState) {
            // Simplified duel rule check
            if (cell.placedBy && cell.placedBy !== duelState.players[duelState.currentPlayerIndex].color) {
                 audioManager.playSound('error');
                 return;
            }
        }
        
        setIsDragging(true);
        setDraggingNumber(cell.value);
        setDragOriginCell([row, col]);

        const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newGrid[row][col].value = 0;
        newGrid[row][col].placedBy = null;
        setGrid(newGrid);
    }, [settings.swooshInput, inputMode, grid, duelState, setGrid]);

    useEffect(() => {
        if (!isDragging) return;

        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            const touch = (e as TouchEvent).touches?.[0];
            const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
            const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
            
            setDragPosition({ x: clientX, y: clientY });
            
            const targetEl = document.elementFromPoint(clientX, clientY);
            const boardEl = targetEl?.closest('[data-sudoku-board]');
            
            if (boardEl && targetEl && targetEl.hasAttribute('data-row')) {
                const row = parseInt(targetEl.getAttribute('data-row')!, 10);
                const col = parseInt(targetEl.getAttribute('data-col')!, 10);
                if (grid && !grid[row][col].isOriginal && grid[row][col].value === 0) {
                    setDragTargetCell([row, col]);
                } else {
                    setDragTargetCell(null);
                }
            } else {
                setDragTargetCell(null);
            }
        };

        const handleDragEnd = () => {
            let currentGrid = grid;
            if (dragOriginCell && draggingNumber && grid) {
                const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
                newGrid[dragOriginCell[0]][dragOriginCell[1]].value = draggingNumber;
                if (duelState) {
                    newGrid[dragOriginCell[0]][dragOriginCell[1]].placedBy = duelState.players[duelState.currentPlayerIndex].color;
                }
                currentGrid = newGrid;
            }

            if (dragTargetCell && draggingNumber && currentGrid) {
                placeNumber(dragTargetCell[0], dragTargetCell[1], draggingNumber, currentGrid, duelState, setDuelState);
            } else if (dragOriginCell && currentGrid) {
                const newGrid = currentGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
                newGrid[dragOriginCell[0]][dragOriginCell[1]].value = 0;
                newGrid[dragOriginCell[0]][dragOriginCell[1]].placedBy = null;
                setGrid(newGrid);
                checkMistakes(newGrid, false, !!duelState);
                audioManager.playSound('delete');
            }
            
            setIsDragging(false);
            setDraggingNumber(null);
            setDragTargetCell(null);
            setDragOriginCell(null);
        };

        window.addEventListener('mousemove', handleDragMove, { passive: false });
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, draggingNumber, dragOriginCell, dragTargetCell, grid, placeNumber, checkMistakes, duelState, setDuelState, setGrid]);

    return {
        isDragging,
        draggingNumber,
        dragPosition,
        dragTargetCell,
        dragOriginCell,
        handleKeypadDragStart,
        handleCellDragStart
    };
};
