

import { useState, useCallback, useEffect, useRef } from 'react';
import { Grid, Position, CellValue, GameConfig, Hint, AppSettings, DuelState } from '../types.ts';
import { getRandomPuzzle } from '../constants.tsx';
import { generateInitialGrid, checkWin, createPuzzleFromSolution } from '../utils.ts';
import { findHint } from '../solver/techniques.ts';
import { audioManager } from '../audio/AudioManager.ts';

type GameState = 'new' | 'inprogress' | 'completed' | 'duel';
type InputMode = 'normal' | 'notes';

export const useGameState = (
    settings: AppSettings, 
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>,
    showWinModal: () => void,
    endDuelCallback: (players: DuelState['players']) => void
) => {
    const { mistakeChecker, gameConfig } = settings;
    const isInitialized = useRef(false);

    const [grid, setGrid] = useState<Grid | null>(null);
    const [solvedGrid, setSolvedGrid] = useState<Grid | null>(null);
    const [selectedCell, setSelectedCell] = useState<Position | null>(null);
    const [gameState, setGameState] = useState<GameState>('new');
    const [time, setTime] = useState(0);
    const [inputMode, setInputMode] = useState<InputMode>('normal');
    const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
    const [hint, setHint] = useState<Hint>(null);

    // Solo game timer
    useEffect(() => {
        let timerId: number;
        if (gameState === 'inprogress') {
            timerId = window.setInterval(() => setTime(prevTime => prevTime + 1), 1000);
        }
        return () => window.clearInterval(timerId);
    }, [gameState]);

    const resetGameState = (newGrid: Grid, solution: Grid, newConfig: GameConfig) => {
        setGrid(newGrid);
        setSolvedGrid(solution);
        setSettings(s => ({ ...s, gameConfig: newConfig }));
        setSelectedCell(null);
        setTime(0);
        setInputMode('normal');
        setIncorrectCells(new Set());
        setHint(null);
    };
    
    const startNewGame = useCallback((newConfig: GameConfig, requestFS: boolean = true) => {
        if (requestFS && settings.startFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
        const solution = getRandomPuzzle(newConfig);
        if (!solution) {
            console.error("No puzzle found for this configuration:", newConfig);
            // We should show a user-facing error here.
            return;
        }

        const puzzle = createPuzzleFromSolution(solution, newConfig.difficulty, newConfig.size);
        const initialGrid = generateInitialGrid(puzzle, newConfig);
        const solutionGrid = generateInitialGrid(solution, newConfig);

        resetGameState(initialGrid, solutionGrid, newConfig);
        setGameState('inprogress');
        audioManager.playBackgroundMusic(settings.musicProfile, newConfig.difficulty);
    }, [setSettings, settings.startFullscreen, settings.musicProfile]);
    
    useEffect(() => {
        if (!isInitialized.current) {
            startNewGame(gameConfig, false);
            isInitialized.current = true;
        }
    }, [startNewGame, gameConfig]);

    const handleCellClick = useCallback((row: number, col: number) => {
        audioManager.playSound('click');
        if (!grid || grid[row][col].isOriginal) return;
        setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
    }, [grid]);

    const checkMistakes = useCallback((currentGrid: Grid, playSound: boolean = false, isDuel: boolean = false) => {
        if (!mistakeChecker || !solvedGrid || isDuel) {
            setIncorrectCells(new Set());
            return;
        }
        const newIncorrectCells = new Set<string>();
        const size = currentGrid.length;
        let hadError = false;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = currentGrid[r][c];
                if (!cell.isOriginal && cell.value !== 0 && cell.value !== solvedGrid[r][c].value) {
                    newIncorrectCells.add(`${r}-${c}`);
                    hadError = true;
                }
            }
        }
        if (playSound && hadError && newIncorrectCells.size > incorrectCells.size) {
            audioManager.playSound('error');
        }
        setIncorrectCells(newIncorrectCells);
    }, [mistakeChecker, solvedGrid, incorrectCells.size]);

    const placeNumber = useCallback((
        row: number, 
        col: number, 
        number: CellValue, 
        currentGrid: Grid,
        duelState: DuelState | null,
        setDuelState: React.Dispatch<React.SetStateAction<DuelState | null>>
    ) => {
        const newGrid = currentGrid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        const cell = newGrid[row][col];

        if (cell.isOriginal) return currentGrid;

        if (gameState === 'duel' && solvedGrid && cell.value === solvedGrid[row][col].value && cell.value !== 0) {
            audioManager.playSound('error');
            return currentGrid;
        }

        const oldValue = cell.value;
        cell.value = number;
        cell.notes.clear();

        if (cell.value === 0) audioManager.playSound('delete');
        else if (cell.value !== oldValue) audioManager.playSound('placeNumber');

        if (gameState === 'duel' && duelState && solvedGrid) {
            const currentPlayer = duelState.players[duelState.currentPlayerIndex];
            const isCorrect = cell.value === solvedGrid[row][col].value;
            let scoreChange = 0;

            if (cell.value !== 0) {
                if (isCorrect) {
                    cell.placedBy = currentPlayer.color;
                    scoreChange = (oldValue !== 0 && cell.placedBy && cell.placedBy !== currentPlayer.color) ? 15 : 10;
                } else {
                    cell.placedBy = currentPlayer.color;
                    scoreChange = -5;
                    audioManager.playSound('error');
                }
            } else {
                cell.placedBy = null;
            }

            const newPlayers = duelState.players.map((p, index) =>
                index === duelState.currentPlayerIndex ? { ...p, score: p.score + scoreChange } : p
            );

            if (checkWin(newGrid, solvedGrid)) {
                const finalPlayers = newPlayers.map((p, index) =>
                    index === duelState.currentPlayerIndex ? { ...p, score: p.score + 50 } : p
                );
                setGrid(newGrid);
                setGameState('completed');
                endDuelCallback(finalPlayers);
                return newGrid;
            }
            setDuelState({ ...duelState, players: newPlayers });
        }

        setGrid(newGrid);
        checkMistakes(newGrid, true, gameState === 'duel');

        if (gameState === 'inprogress' && solvedGrid && checkWin(newGrid, solvedGrid)) {
            setGameState('completed');
            showWinModal();
            audioManager.playVictoryMusic();
        }
        return newGrid;
    }, [checkMistakes, gameState, solvedGrid, showWinModal, endDuelCallback]);

    const handleNumberClick = useCallback((number: CellValue) => {
        if (!selectedCell || !grid) return;
        setHint(null);
        const [row, col] = selectedCell;
        const cell = grid[row][col];

        if (inputMode === 'notes') {
            if (cell.value === 0) {
                audioManager.playSound('click');
                const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
                const newCell = newGrid[row][col];
                if (newCell.notes.has(number)) newCell.notes.delete(number);
                else newCell.notes.add(number);
                setGrid(newGrid);
            }
        } else {
            const newValue = grid[row][col].value === number ? 0 : number;
            // This is a simplification. The full duel logic needs to be passed in.
            // For now, let's pass null for duel state as we'll handle that from App.tsx
            placeNumber(row, col, newValue, grid, null, () => {});
        }
    }, [selectedCell, grid, inputMode, placeNumber]);

    const handleDeleteClick = useCallback(() => {
        if (!selectedCell || !grid) return;
        const [row, col] = selectedCell;
        if (grid[row][col].isOriginal) return;

        audioManager.playSound('delete');
        setHint(null);
        
        // Simplified for hook - complex duel logic will be managed via placeNumber
        const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newGrid[row][col].value = 0;
        newGrid[row][col].placedBy = null;
        setGrid(newGrid);
        checkMistakes(newGrid, false, gameState === 'duel');
    }, [selectedCell, grid, checkMistakes, gameState]);

    const revealHint = useCallback(() => {
        if (!hint || !grid || !solvedGrid) return;
        audioManager.playSound('placeNumber');
        const [row, col] = hint.position;
        const newGrid = grid.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
        newGrid[row][col].value = solvedGrid[row][col].value;
        newGrid[row][col].notes.clear();
        setGrid(newGrid);
        checkMistakes(newGrid, false, gameState === 'duel');
        setHint(null);
        if (checkWin(newGrid, solvedGrid)) {
            if (gameState === 'inprogress') {
                setGameState('completed');
                showWinModal();
                audioManager.playVictoryMusic();
            } else {
                // Duel win logic is handled in placeNumber
            }
        }
    }, [hint, grid, solvedGrid, checkMistakes, gameState, showWinModal]);

    const handleHintClick = useCallback((currentConfig: GameConfig) => {
        if (gameState === 'new' || gameState === 'completed' || !grid) return;
        audioManager.playSound('click');
        if (hint && hint.stage === 'nudge') {
            setHint({ ...hint, stage: 'tutor' });
        } else {
            const foundHint = findHint(grid, currentConfig);
            if (foundHint) {
                setHint({ ...foundHint, stage: 'nudge' });
                setSelectedCell(foundHint.position);
            } else {
                console.log("No simple hint available.");
            }
        }
    }, [gameState, grid, hint]);

    return {
        grid, setGrid,
        solvedGrid, setSolvedGrid,
        selectedCell, setSelectedCell,
        gameState, setGameState,
        time,
        inputMode, setInputMode,
        incorrectCells, setIncorrectCells,
        hint, setHint,
        startNewGame,
        handleCellClick,
        checkMistakes,
        placeNumber,
        handleNumberClick,
        handleDeleteClick,
        revealHint,
        handleHintClick,
        resetGameState
    };
};