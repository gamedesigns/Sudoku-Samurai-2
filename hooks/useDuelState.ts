import { useState, useEffect, useCallback, useRef } from 'react';
import { DuelState, MultiplayerConfig, Player, GameConfig, Grid, MusicProfile, Difficulty } from '../types.ts';
import { getRandomPuzzle } from '../constants.tsx';
import { generateInitialGrid, createPuzzleFromSolution } from '../utils.ts';
import { audioManager } from '../audio/AudioManager.ts';
import { PLAYER_COLORS } from '../config.ts';

type GameStateSetter = React.Dispatch<React.SetStateAction<'new' | 'inprogress' | 'completed' | 'duel'>>;
type ResetGameCallback = (grid: Grid, solution: Grid, config: GameConfig) => void;

export const useDuelState = (
    setGameState: GameStateSetter,
    resetGameState: ResetGameCallback,
    showTurnReadyModal: () => void,
    showResultsModal: () => void
) => {
    const [duelConfig, setDuelConfig] = useState<MultiplayerConfig | null>(null);
    const [duelState, setDuelState] = useState<DuelState | null>(null);
    const [tempDuelConfig, setTempDuelConfig] = useState<MultiplayerConfig>({
        playerCount: 2,
        puzzleSize: 6,
        difficulty: 'Easy',
        players: PLAYER_COLORS.slice(0, 2).map(p => ({ ...p, score: 0 })),
        masterTimer: 600,
        turnTimer: 60,
    });
    const lastDuelConfig = useRef<MultiplayerConfig | null>(null);

    // Duel timers
    useEffect(() => {
        let timerId: number;
        if (duelState && !duelState.isPaused && !duelState.winner) {
            timerId = window.setInterval(() => {
                setDuelState(d => {
                    if (!d) return null;
                    const newMasterTime = d.masterTimeLeft - 1;
                    const newTurnTime = d.turnTimeLeft - 1;

                    if (newMasterTime <= 0) {
                        endDuel(d.players);
                        return { ...d, masterTimeLeft: 0, turnTimeLeft: 0, isPaused: true };
                    }
                    if (newTurnTime <= 0) {
                        endPlayerTurn();
                        return { ...d, turnTimeLeft: 0, isPaused: true };
                    }
                    return { ...d, masterTimeLeft: newMasterTime, turnTimeLeft: newTurnTime };
                });
            }, 1000);
        }
        return () => window.clearInterval(timerId);
    }, [duelState]); // eslint-disable-line react-hooks/exhaustive-deps

    const endDuel = (finalPlayers: Player[]) => {
        let winner = null;
        if (finalPlayers.length > 0) {
            winner = [...finalPlayers].sort((a, b) => b.score - a.score)[0];
        }
        setDuelState(d => d ? { ...d, winner, isPaused: true } : null);
        showResultsModal();
        setGameState('completed');
        audioManager.playVictoryMusic();
    };

    const endPlayerTurn = useCallback(() => {
        if (!duelState || !duelConfig) return;
        const nextPlayerIndex = (duelState.currentPlayerIndex + 1) % duelConfig.playerCount;
        setDuelState(d => d ? { ...d, currentPlayerIndex: nextPlayerIndex, isPaused: true } : null);
        showTurnReadyModal();
    }, [duelState, duelConfig, showTurnReadyModal]);

    const startPlayerTurn = useCallback(() => {
        if (!duelState || !duelConfig) return;
        setDuelState(d => d ? { ...d, turnTimeLeft: duelConfig.turnTimer, isPaused: false } : null);
    }, [duelState, duelConfig]);

    const startDuel = useCallback((duelSetup: MultiplayerConfig, musicProfile: MusicProfile, difficulty: Difficulty) => {
        const duelGameConfig: GameConfig = {
            size: duelSetup.puzzleSize,
            mode: 'Duel',
            difficulty: duelSetup.difficulty,
        };
        const solution = getRandomPuzzle(duelGameConfig);
        if (!solution) {
            console.error("No multiplayer puzzle found for this configuration:", duelGameConfig);
            return;
        }

        const puzzle = createPuzzleFromSolution(solution, duelGameConfig.difficulty, duelGameConfig.size);
        const initialGrid = generateInitialGrid(puzzle, duelGameConfig);
        const solutionGrid = generateInitialGrid(solution, duelGameConfig);
        
        resetGameState(initialGrid, solutionGrid, duelGameConfig);

        const playersWithResetScores = duelSetup.players.map(p => ({ ...p, score: 0 }));
        const newDuelConfig = { ...duelSetup, players: playersWithResetScores };
        setDuelConfig(newDuelConfig);
        lastDuelConfig.current = newDuelConfig;

        setDuelState({
            players: playersWithResetScores,
            currentPlayerIndex: 0,
            masterTimeLeft: duelSetup.masterTimer,
            turnTimeLeft: duelSetup.turnTimer,
            isPaused: true,
            winner: null,
        });
        setGameState('duel');
        showTurnReadyModal();
        audioManager.playBackgroundMusic(musicProfile, difficulty);
    }, [resetGameState, setGameState, showTurnReadyModal]);

    return {
        duelConfig,
        duelState, setDuelState,
        tempDuelConfig, setTempDuelConfig,
        lastDuelConfig,
        startDuel,
        endDuel,
        startPlayerTurn
    };
};