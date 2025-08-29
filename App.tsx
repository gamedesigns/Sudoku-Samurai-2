import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, X, Settings, Info, Palette, Sun, Moon, Award, Play, RefreshCw, Lightbulb, Flame, Volume2, VolumeX, Brush, Swords, Shuffle } from 'lucide-react';

import { getRandomPuzzle, hasPuzzles } from './constants';
import { lightTheme, darkTheme, warmTheme } from './themes';
import { Grid, Position, CellValue, GameConfig, Hint, AppSettings, SoundEvent, MusicProfile, DisplayMode, MultiplayerConfig, Player, DuelState, PlayerColor } from './types';
import { generateInitialGrid, checkWin, formatTime, createPuzzleFromSolution } from './utils';
import { findHint } from './solver/techniques';

import Modal from './components/Modal';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Header from './components/Header';
import HintTutor from './components/HintTutor';
import DragGhost from './components/DragGhost';

import { useLocalStorage } from './hooks/useLocalStorage';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { DEFAULT_SETTINGS, LANGUAGES, GAME_MODES, DEFAULT_GAME_CONFIG, MUSIC_PROFILES, PLAYER_COLORS } from './config';
import { audioManager } from './audio/AudioManager';


type GameState = 'new' | 'inprogress' | 'completed' | 'duel';
type InputMode = 'normal' | 'notes';

const playerColorClasses: Record<PlayerColor, { bg: string, text: string, border: string }> = {
    red: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    blue: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    green: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
    violet: { bg: 'bg-violet-500', text: 'text-white', border: 'border-violet-500' },
};


const Game: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('sudokuSettings', DEFAULT_SETTINGS);
  const { theme: themeName, highlightMode, language, mistakeChecker, gameConfig, startFullscreen, musicVolume, sfxVolume, isMuted, musicProfile, phistomefelRing, displayMode, swooshInput } = settings;
  const { t, setLang, lang } = useI18n();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (lang !== language) {
      setLang(language);
    }
  }, [language, lang, setLang]);
  
  const [grid, setGrid] = useState<Grid | null>(null);
  const [solvedGrid, setSolvedGrid] = useState<Grid | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isThemesOpen, setThemesOpen] = useState(false);
  const [isNewGameOpen, setNewGameOpen] = useState(false);
  const [isWinModalOpen, setWinModalOpen] = useState(false);
  const [isDuelSetupOpen, setDuelSetupOpen] = useState(false);
  const [isTurnReadyModalOpen, setTurnReadyModalOpen] = useState(false);
  const [isDuelResultsOpen, setDuelResultsOpen] = useState(false);

  const [gameState, setGameState] = useState<GameState>('new');
  const [time, setTime] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('normal');
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<Hint>(null);
  
  const [tempGameConfig, setTempGameConfig] = useState<GameConfig>(gameConfig);
  
  // --- Multiplayer State ---
  const [duelConfig, setDuelConfig] = useState<MultiplayerConfig | null>(null);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [tempDuelConfig, setTempDuelConfig] = useState<MultiplayerConfig>({
      playerCount: 2,
      puzzleSize: 6,
      difficulty: 'Easy',
      players: PLAYER_COLORS.slice(0, 2).map(p => ({ ...p, score: 0 })),
      masterTimer: 600, // 10 minutes
      turnTimer: 60, // 60 seconds
  });
  const lastDuelConfig = useRef<MultiplayerConfig | null>(null);


  // State for all Drag & Drop operations
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingNumber, setDraggingNumber] = useState<CellValue | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [dragTargetCell, setDragTargetCell] = useState<Position | null>(null);
  const [dragOriginCell, setDragOriginCell] = useState<Position | null>(null);


  const themes = { light: lightTheme, warm: warmTheme, dark: darkTheme };
  const theme = themes[themeName];
  
  const initializeAudio = useCallback(() => {
    if (!audioManager.isInitialized) {
        audioManager.initialize();
        audioManager.loadAll();
    }
  }, []);

  useEffect(() => {
      audioManager.setMusicVolume(musicVolume);
      audioManager.setSfxVolume(sfxVolume);
      audioManager.setMuted(isMuted);
  }, [musicVolume, sfxVolume, isMuted]);

  // Solo game timer
  useEffect(() => {
    let timerId: number;
    if (gameState === 'inprogress') {
      timerId = window.setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      window.clearInterval(timerId);
    };
  }, [gameState]);

  // Duel timers
  useEffect(() => {
    let timerId: number;
    if (gameState === 'duel' && duelState && !duelState.isPaused) {
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
  }, [gameState, duelState]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const startNewGame = useCallback((newConfig: GameConfig, requestFS: boolean = true) => {
    initializeAudio();
    if (requestFS && startFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    }
    const solution = getRandomPuzzle(newConfig);
    if (!solution) {
        console.error("No puzzle found for this configuration:", newConfig);
        alert(t('noPuzzleError'));
        return;
    }
    
    const puzzle = createPuzzleFromSolution(solution, newConfig.difficulty, newConfig.size);
    const initialGrid = generateInitialGrid(puzzle, newConfig);
    const solutionGrid = generateInitialGrid(solution, newConfig);

    setGrid(initialGrid);
    setSolvedGrid(solutionGrid);
    setSettings(s => ({ ...s, gameConfig: newConfig}));
    setSelectedCell(null);
    setGameState('inprogress');
    setTime(0);
    setInputMode('normal');
    setWinModalOpen(false);
    setNewGameOpen(false);
    setIncorrectCells(new Set());
    setHint(null);
    setDuelConfig(null);
    setDuelState(null);
    audioManager.playBackgroundMusic(settings.musicProfile, newConfig.difficulty);
  }, [setSettings, t, startFullscreen, initializeAudio, settings.musicProfile]);
  
  useEffect(() => {
    if (!isInitialized.current) {
      startNewGame(gameConfig, false); // Don't request fullscreen on initial load
      isInitialized.current = true;
    }
  }, [startNewGame, gameConfig]);

  const endDuel = (finalPlayers: Player[]) => {
      let winner = null;
      if (finalPlayers.length > 0) {
        winner = [...finalPlayers].sort((a, b) => b.score - a.score)[0];
      }
      setDuelState(d => d ? { ...d, winner, isPaused: true } : null);
      setDuelResultsOpen(true);
      setGameState('completed');
      audioManager.playVictoryMusic();
  };
  
  const endPlayerTurn = useCallback(() => {
    if (!duelState || !duelConfig) return;
    const nextPlayerIndex = (duelState.currentPlayerIndex + 1) % duelConfig.playerCount;
    setDuelState(d => d ? { ...d, currentPlayerIndex: nextPlayerIndex, isPaused: true } : null);
    setTurnReadyModalOpen(true);
  }, [duelState, duelConfig]);

  const startPlayerTurn = useCallback(() => {
    if (!duelState || !duelConfig) return;
    setTurnReadyModalOpen(false);
    setDuelState(d => d ? { ...d, turnTimeLeft: duelConfig.turnTimer, isPaused: false } : null);
  }, [duelState, duelConfig]);
  
  const startDuel = useCallback((duelSetup: MultiplayerConfig) => {
    const duelGameConfig: GameConfig = {
        size: duelSetup.puzzleSize,
        mode: 'Duel',
        difficulty: duelSetup.difficulty,
    };
    initializeAudio();
    const solution = getRandomPuzzle(duelGameConfig);
     if (!solution) {
        console.error("No multiplayer puzzle found for this configuration:", duelGameConfig);
        alert(t('noPuzzleError'));
        return;
    }

    const puzzle = createPuzzleFromSolution(solution, duelGameConfig.difficulty, duelGameConfig.size);
    const initialGrid = generateInitialGrid(puzzle, duelGameConfig);
    const solutionGrid = generateInitialGrid(solution, duelGameConfig);

    setGrid(initialGrid);
    setSolvedGrid(solutionGrid);
    
    // Reset scores for new duel
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
    
    closeAllModals();
    setTurnReadyModalOpen(true); // Show the first "Ready" screen
    audioManager.playBackgroundMusic(settings.musicProfile, duelSetup.difficulty);

  }, [initializeAudio, t, settings.musicProfile]);

  const handleCellClick = useCallback((row: number, col: number) => {
    audioManager.playSound('click');
    if (!grid || grid[row][col].isOriginal) return;
    if (gameState === 'duel' && duelState?.isPaused) return; // Prevent selection between turns
    setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
  }, [grid, gameState, duelState]);
  
  const checkMistakes = useCallback((currentGrid: Grid, playSound: boolean = false) => {
    if (!mistakeChecker || !solvedGrid || gameState === 'duel') {
        setIncorrectCells(new Set());
        return;
    }
    const newIncorrectCells = new Set<string>();
    const size = currentGrid.length;
    let hadError = false;
    for(let r=0; r < size; r++) {
        for (let c=0; c < size; c++) {
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
  }, [mistakeChecker, solvedGrid, incorrectCells.size, gameState]);
  
  const placeNumber = useCallback((row: number, col: number, number: CellValue, currentGrid: Grid) => {
      const newGrid = currentGrid.map(r => r.map(c => ({...c, notes: new Set(c.notes)}))); 
      const cell = newGrid[row][col];
      
      if (cell.isOriginal) return currentGrid;

      // In Duel mode, can't overwrite a correct number
      if (gameState === 'duel' && solvedGrid && cell.value === solvedGrid[row][col].value && cell.value !== 0) {
          audioManager.playSound('error');
          return currentGrid;
      }

      const oldValue = cell.value;
      const oldOwner = cell.placedBy;
      cell.value = number;
      cell.notes.clear();
      
      if (cell.value === 0) {
        audioManager.playSound('delete');
      } else if (cell.value !== oldValue) {
        audioManager.playSound('placeNumber');
      }
      
      // Handle Duel scoring
      if (gameState === 'duel' && duelState && duelConfig && solvedGrid) {
          const currentPlayer = duelState.players[duelState.currentPlayerIndex];
          const isCorrect = cell.value === solvedGrid[row][col].value;
          let scoreChange = 0;

          if (cell.value !== 0) { // If placing a number (not deleting)
              if (isCorrect) {
                  cell.placedBy = currentPlayer.color;
                  if (oldValue !== 0 && oldOwner && oldOwner !== currentPlayer.color) {
                      scoreChange = 15; // Steal bonus
                  } else {
                      scoreChange = 10; // Normal correct
                  }
              } else {
                  cell.placedBy = currentPlayer.color;
                  scoreChange = -5; // Incorrect placement
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
                  index === duelState.currentPlayerIndex ? { ...p, score: p.score + 50 } : p // Final bonus
              );
              setGrid(newGrid);
              endDuel(finalPlayers);
              return newGrid;
          }
          setDuelState({ ...duelState, players: newPlayers });
      }
      
      setGrid(newGrid);
      checkMistakes(newGrid, true);
      
      if (gameState === 'inprogress' && solvedGrid && checkWin(newGrid, solvedGrid)) {
          setGameState('completed');
          setWinModalOpen(true);
          audioManager.playVictoryMusic();
      }
      return newGrid;
  }, [checkMistakes, gameState, duelState, duelConfig, solvedGrid]); // eslint-disable-line react-hooks/exhaustive-deps

  const duelConfigToGameConfig = (dc: MultiplayerConfig): GameConfig => ({
      size: dc.puzzleSize,
      mode: 'Duel',
      difficulty: dc.difficulty,
  });

  const handleNumberClick = useCallback((number: CellValue) => {
    if (!selectedCell || !grid) return;
    if (gameState === 'duel' && duelState?.isPaused) return;

    setHint(null);
    
    const [row, col] = selectedCell;
    const cell = grid[row][col];

    if (inputMode === 'notes') {
        if(cell.value === 0) {
            audioManager.playSound('click');
            const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)}))); 
            const newCell = newGrid[row][col];
            if (newCell.notes.has(number)) {
                newCell.notes.delete(number);
            } else {
                newCell.notes.add(number);
            }
            setGrid(newGrid);
        }
    } else {
        const oldValue = grid[row][col].value;
        const newValue = oldValue === number ? 0 : number;
        placeNumber(row, col, newValue, grid);
    }
  }, [selectedCell, grid, inputMode, gameState, duelState, placeNumber]);
  
  const handleDeleteClick = useCallback(() => {
    if (!selectedCell || !grid) return;
    if (gameState === 'duel' && duelState?.isPaused) return;

    const [row, col] = selectedCell;
    if (grid[row][col].isOriginal) return;
    
    audioManager.playSound('delete');
    setHint(null);

    // In duel mode, you can only delete your own incorrect numbers or any number during your turn
    if (gameState === 'duel' && duelState) {
        const cell = grid[row][col];
        const currentPlayerColor = duelState.players[duelState.currentPlayerIndex].color;
        if (cell.placedBy && cell.placedBy !== currentPlayerColor && solvedGrid && cell.value === solvedGrid[row][col].value) {
            audioManager.playSound('error');
            return; // Can't delete opponent's correct number
        }
    }

    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = 0;
    newGrid[row][col].placedBy = null;
    setGrid(newGrid);
    checkMistakes(newGrid);
  }, [selectedCell, grid, gameState, checkMistakes, duelState, solvedGrid]);

  // --- START OF ADVANCED DRAG & DROP LOGIC ---

  const handleKeypadDragStart = useCallback((number: CellValue) => {
    if (!swooshInput || inputMode === 'notes' || selectedCell) return;
    if (gameState === 'duel' && duelState?.isPaused) return;
    setIsDragging(true);
    setDraggingNumber(number);
    setDragOriginCell(null);
  }, [swooshInput, inputMode, selectedCell, gameState, duelState]);
  
  const handleCellDragStart = useCallback((row: number, col: number) => {
    if (!swooshInput || inputMode === 'notes' || !grid) return;
    if (gameState === 'duel' && duelState?.isPaused) return;

    const cell = grid[row][col];
    if (cell.isOriginal || cell.value === 0) return;

    // Duel move rules
     if (gameState === 'duel' && duelState) {
        const currentPlayerColor = duelState.players[duelState.currentPlayerIndex].color;
        if (cell.placedBy && cell.placedBy !== currentPlayerColor && solvedGrid && cell.value === solvedGrid[row][col].value) {
            audioManager.playSound('error');
            return; // Can't move opponent's correct number
        }
    }

    setIsDragging(true);
    setDraggingNumber(cell.value);
    setDragOriginCell([row, col]);
    setSelectedCell(null);

    // Temporarily remove number from grid for "pick up" effect
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = 0;
    newGrid[row][col].placedBy = null;
    setGrid(newGrid);
  }, [swooshInput, inputMode, grid, gameState, duelState, solvedGrid]);

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
            setDragTargetCell(null); // We are outside the board
        }
    };

    const handleDragEnd = () => {
        let currentGrid = grid;
        if (dragOriginCell && draggingNumber) { // If a move was cancelled, restore the number
             const newGrid = grid!.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
             newGrid[dragOriginCell[0]][dragOriginCell[1]].value = draggingNumber;
             // Restore owner too if it was a duel move
             if (gameState === 'duel' && duelState) {
                newGrid[dragOriginCell[0]][dragOriginCell[1]].placedBy = duelState.players[duelState.currentPlayerIndex].color;
             }
             currentGrid = newGrid;
        }

        if (dragTargetCell && draggingNumber && currentGrid) {
            // A valid drop happened (move or place)
            placeNumber(dragTargetCell[0], dragTargetCell[1], draggingNumber, currentGrid);
        } else if (dragOriginCell) {
            // No valid drop target, it was a delete or a cancelled move
            const newGrid = currentGrid!.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
            newGrid[dragOriginCell[0]][dragOriginCell[1]].value = 0; // The cell is now empty
            newGrid[dragOriginCell[0]][dragOriginCell[1]].placedBy = null;
            setGrid(newGrid);
            checkMistakes(newGrid);
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
  }, [isDragging, draggingNumber, dragOriginCell, dragTargetCell, grid, placeNumber, checkMistakes, gameState, duelState]);

  // --- END OF ADVANCED DRAG & DROP LOGIC ---

  const revealHint = useCallback(() => {
    if (!hint || !grid || !solvedGrid) return;
    audioManager.playSound('placeNumber');
    const [row, col] = hint.position;
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = solvedGrid[row][col].value;
    newGrid[row][col].notes.clear();
    setGrid(newGrid);
    checkMistakes(newGrid);
    setHint(null);
    const currentConfig = gameState === 'duel' && duelConfig ? duelConfigToGameConfig(duelConfig) : gameConfig;
    if (checkWin(newGrid, solvedGrid)) {
        if (gameState === 'inprogress') {
            setGameState('completed');
            setWinModalOpen(true);
            audioManager.playVictoryMusic();
        } else if (gameState === 'duel' && duelState) {
            endDuel(duelState.players);
        }
    }
  }, [hint, grid, solvedGrid, checkMistakes, gameConfig, gameState, duelConfig, duelState]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleHintClick = useCallback(() => {
    const currentConfig = gameState === 'duel' && duelConfig ? duelConfigToGameConfig(duelConfig) : gameConfig;
    if (gameState === 'new' || gameState === 'completed' || !grid) return;
    audioManager.playSound('click');
    if (hint && hint.stage === 'nudge') {
        setHint({ ...hint, stage: 'tutor'});
    } else {
        const foundHint = findHint(grid, currentConfig);
        if (foundHint) {
            setHint({ ...foundHint, stage: 'nudge' });
            setSelectedCell(foundHint.position);
        } else {
            console.log("No simple hint available.");
        }
    }
  }, [gameState, grid, hint, gameConfig, duelConfig]);

  const closeAllModals = () => {
      setSettingsOpen(false);
      setAboutOpen(false);
      setThemesOpen(false);
      setMenuOpen(false);
      setNewGameOpen(false);
      setDuelSetupOpen(false);
      setDuelResultsOpen(false);
  };

  const handleResetSettings = () => {
    audioManager.playSound('click');
    setSettings(DEFAULT_SETTINGS);
    startNewGame(DEFAULT_GAME_CONFIG);
    closeAllModals();
  };
  
  const handleDisplayModeChange = () => {
    audioManager.playSound('click');
    const displayModes: DisplayMode[] = ['number', 'color', 'letter', 'japanese', 'kids'];
    const currentIndex = displayModes.indexOf(displayMode);
    const nextIndex = (currentIndex + 1) % displayModes.length;
    setSettings(s => ({ ...s, displayMode: displayModes[nextIndex] }));
  };
  
  const handleRandomizePlayers = () => {
    audioManager.playSound('click');
    setTempDuelConfig(c => ({
        ...c,
        players: [...c.players].sort(() => Math.random() - 0.5)
    }));
  };
  
  const currentDuelPlayer = duelState ? duelState.players[duelState.currentPlayerIndex] : null;
  const currentConfig = gameState === 'duel' && duelConfig ? duelConfigToGameConfig(duelConfig) : gameConfig;

  const GameControls: React.FC = () => (
      <div className={`flex items-center justify-center p-1 rounded-full ${theme.cardBg} border-2 ${theme.border} shadow-inner w-full`}>
          <button onClick={() => { setInputMode('normal'); audioManager.playSound('click'); }} className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all ${inputMode === 'normal' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              {t('number')}
          </button>
          <button onClick={() => { setInputMode('notes'); audioManager.playSound('click'); }} className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all ${inputMode === 'notes' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              {t('notes')}
          </button>
          <button onClick={() => { setDuelSetupOpen(true); audioManager.playSound('click'); }} className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all flex items-center justify-center gap-1 ${gameState === 'duel' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              <Swords size={16} /> {t('duel')}
          </button>
      </div>
  );
  
  const DuelHeader: React.FC = () => {
    if (gameState !== 'duel' || !duelState || !duelConfig) return null;
    return (
        <div className="px-2 max-w-md mx-auto w-full mb-2">
            <div className="flex justify-between items-center mb-1">
                <span className='font-bold text-lg'>{t('masterTime')}</span>
                <span className='font-bold text-lg tabular-nums'>{formatTime(duelState.masterTimeLeft)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {duelState.players.map((player, index) => {
                    const colorClass = playerColorClasses[player.color];
                    return (
                        <div key={player.id} className={`p-2 rounded-lg transition-all border-2 ${duelState.currentPlayerIndex === index ? `${colorClass.bg} ${colorClass.text} ${colorClass.border} shadow-lg` : `${theme.cardBg} border-transparent`}`}>
                           <div className='text-xs opacity-80'>{t(player.nameKey)}</div>
                           <div className='font-bold text-lg'>{player.score}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
  };

  if (!grid) {
      return <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text} flex items-center justify-center`}>Loading...</div>;
  }

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`} onClick={initializeAudio}>
      {isDragging && draggingNumber && (
          <DragGhost
            number={draggingNumber}
            position={dragPosition}
            displayMode={displayMode}
            theme={theme}
            gameConfig={currentConfig}
          />
      )}
      <div className="relative max-w-5xl mx-auto flex flex-col min-h-screen">
        <Header 
            theme={theme} 
            isMenuOpen={isMenuOpen} 
            onMenuToggle={() => { setMenuOpen(!isMenuOpen); audioManager.playSound('click'); }}
            isMuted={isMuted}
            onMuteToggle={() => { setSettings(s => ({ ...s, isMuted: !s.isMuted })); audioManager.playSound('click'); }}
        />

        {isMenuOpen && (
          <div className={`absolute top-20 right-4 ${theme.cardBg} rounded-2xl shadow-xl z-50 border-2 ${theme.border} overflow-hidden w-48`}>
             <button
              onClick={() => { setTempGameConfig(gameConfig); setNewGameOpen(true); setMenuOpen(false); audioManager.playSound('click'); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Play className="w-5 h-5" />
              <span>{t('newGame')}</span>
            </button>
            <button
              onClick={() => { setSettingsOpen(true); setMenuOpen(false); audioManager.playSound('click'); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Settings className="w-5 h-5" />
              <span>{t('settings')}</span>
            </button>
            <button
              onClick={() => { setThemesOpen(true); setMenuOpen(false); audioManager.playSound('click'); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Palette className="w-5 h-5" />
              <span>{t('themes')}</span>
            </button>
            <button
              onClick={handleResetSettings}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <RefreshCw className="w-5 h-5" />
              <span>{t('resetSettings')}</span>
            </button>
            <button
              onClick={() => { setAboutOpen(true); setMenuOpen(false); audioManager.playSound('click'); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Info className="w-5 h-5" />
              <span>{t('about')}</span>
            </button>
          </div>
        )}

        <main className="flex-grow flex flex-col justify-center p-2 sm:p-4">
          { gameState !== 'duel' ? (
            <div className="flex justify-between items-center px-2 max-w-md mx-auto w-full">
                <div className="flex items-center space-x-2">
                    <button onClick={handleDisplayModeChange} className={`p-1.5 rounded-md ${theme.button}`} title={t('displayModeTooltip')}>
                        <Brush className="w-4 h-4" />
                    </button>
                    <div className="text-sm font-medium">{t(gameConfig.mode)} • {t(gameConfig.difficulty.toLowerCase())}</div>
                </div>
                <div className="text-lg font-semibold tabular-nums">{formatTime(time)}</div>
            </div>
          ) : <DuelHeader /> }
          <div className="game-layout flex flex-col items-center flex-grow justify-center">
            <div className="board-wrapper w-full max-w-md">
                <SudokuBoard 
                    grid={grid}
                    gameConfig={currentConfig}
                    displayMode={displayMode}
                    selectedCell={selectedCell}
                    dragTargetCell={dragTargetCell}
                    dragOriginCell={dragOriginCell}
                    theme={theme}
                    highlightMode={highlightMode}
                    onCellClick={handleCellClick}
                    onCellDragStart={handleCellDragStart}
                    incorrectCells={incorrectCells}
                    hint={hint}
                    phistomefelRing={phistomefelRing}
                    duelState={duelState}
                />
            </div>
            <div className="controls-wrapper mt-4 w-full max-w-md flex flex-col items-center space-y-4">
              <GameControls />
              <div className="flex items-stretch w-full space-x-2 sm:space-x-3">
                <NumberPad
                  theme={theme}
                  gameConfig={currentConfig}
                  displayMode={displayMode}
                  onNumberClick={handleNumberClick}
                  onDeleteClick={handleDeleteClick}
                  onKeypadDragStart={handleKeypadDragStart}
                />
                 <div className="relative h-auto aspect-square">
                    {gameState === 'duel' && duelState && !duelState.isPaused && (
                         <div className="absolute inset-0 transition-all" style={{ transform: 'rotate(-90deg)'}}>
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={theme.button}
                                    strokeWidth="3"
                                />
                                <path
                                    className="transition-all duration-500"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={`#${currentDuelPlayer?.color === 'red' ? 'ef4444' : currentDuelPlayer?.color === 'blue' ? '3b82f6' : currentDuelPlayer?.color === 'green' ? '22c55e' : '8b5cf6'}`}
                                    strokeWidth="3"
                                    strokeDasharray={`${(duelState.turnTimeLeft / duelConfig!.turnTimer) * 100}, 100`}
                                />
                            </svg>
                        </div>
                    )}
                    <button 
                        onClick={handleHintClick} 
                        disabled={gameState === 'new' || gameState === 'completed'}
                        className={`w-full h-full rounded-lg sm:rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </main>
        
        {hint && hint.stage === 'tutor' && (
            <HintTutor hint={hint} theme={theme} onClose={() => { setHint(null); audioManager.playSound('click'); }} onReveal={revealHint} />
        )}

        <Modal show={isSettingsOpen} onClose={() => { setSettingsOpen(false); audioManager.playSound('click'); }} title={t('settings')} theme={theme}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('highlightMode')}</span>
              <button
                onClick={() => { setSettings(s => ({ ...s, highlightMode: !s.highlightMode })); audioManager.playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-colors ${highlightMode ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${highlightMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('mistakeChecker')}</span>
              <button
                onClick={() => { setSettings(s => ({ ...s, mistakeChecker: !s.mistakeChecker })); audioManager.playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-colors ${mistakeChecker ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${mistakeChecker ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">{t('swooshInput')}</span>
              <button
                onClick={() => { setSettings(s => ({ ...s, swooshInput: !s.swooshInput })); audioManager.playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-colors ${swooshInput ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${swooshInput ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('phistomefelRing')}</span>
              <button
                onClick={() => { setSettings(s => ({ ...s, phistomefelRing: !s.phistomefelRing })); audioManager.playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-colors ${phistomefelRing ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${phistomefelRing ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">{t('startFullscreen')}</span>
              <button
                onClick={() => { setSettings(s => ({ ...s, startFullscreen: !s.startFullscreen })); audioManager.playSound('click'); }}
                className={`w-12 h-6 rounded-full transition-colors ${startFullscreen ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${startFullscreen ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
             <div>
              <span className="font-medium block mb-2">{t('musicProfile')}</span>
              <select
                  value={musicProfile}
                  onChange={(e) => {
                      const newProfile = e.target.value as MusicProfile;
                      setSettings(s => ({ ...s, musicProfile: newProfile }));
                      audioManager.playBackgroundMusic(newProfile, gameConfig.difficulty);
                      audioManager.playSound('click');
                  }}
                  className={`w-full p-3 rounded-lg border-2 ${theme.border} ${theme.cardBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              >
                  {MUSIC_PROFILES.map(profile => (
                      <option key={profile} value={profile}>{t(`musicProfile_${profile.toLowerCase()}`)}</option>
                  ))}
              </select>
            </div>
            <div>
              <span className="font-medium block mb-2">{t('musicVolume')}</span>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={musicVolume}
                  onChange={(e) => setSettings(s => ({ ...s, musicVolume: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
            </div>
            <div>
              <span className="font-medium block mb-2">{t('sfxVolume')}</span>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={sfxVolume}
                  onChange={(e) => setSettings(s => ({ ...s, sfxVolume: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
            </div>
            <div>
              <span className="font-medium block mb-2">{t('language')}</span>
              <div className="flex space-x-2">
                {LANGUAGES.map(({ code, name }) => (
                    <button key={code} onClick={() => { setSettings(s => ({...s, language: code})); audioManager.playSound('click'); }} className={`w-full p-2 text-sm rounded-lg font-semibold border-2 transition-colors ${language === code ? `border-blue-500 ${lightTheme.cellHighlight} ${lightTheme.userText}` : `border-transparent ${theme.button}`}`}>
                        {name}
                    </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        <Modal show={isThemesOpen} onClose={() => { setThemesOpen(false); audioManager.playSound('click'); }} title={t('themes')} theme={theme}>
          <div className="space-y-3">
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'light'})); audioManager.playSound('click'); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'light' ? `border-blue-500 ${lightTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
            >
              <Sun className={`w-5 h-5 ${themeName === 'light' ? 'text-blue-500' : theme.text}`} />
              <span className={`${themeName === 'light' ? lightTheme.userText : theme.text}`}>{t('lightTheme')}</span>
            </button>
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'warm'})); audioManager.playSound('click'); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'warm' ? `border-red-500 ${warmTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
            >
              <Flame className={`w-5 h-5 ${themeName === 'warm' ? 'text-red-500' : theme.text}`} />
              <span className={`${themeName === 'warm' ? warmTheme.userText : theme.text}`}>{t('warmTheme')}</span>
            </button>
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'dark'})); audioManager.playSound('click'); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'dark' ? 'border-blue-500 bg-blue-900/20' : `border-transparent ${theme.button}`}`}
            >
              <Moon className={`w-5 h-5 ${themeName === 'dark' ? 'text-blue-500' : theme.text}`} />
              <span className={`${themeName === 'dark' ? 'text-blue-300' : theme.text}`}>{t('darkTheme')}</span>
            </button>
          </div>
        </Modal>

        <Modal show={isAboutOpen} onClose={() => { setAboutOpen(false); audioManager.playSound('click'); }} title={t('aboutTitle')} theme={theme}>
          <div className="space-y-4 text-sm">
            <p>{t('aboutText1')}</p>
            <p className="text-xs opacity-70">{t('aboutVersion', {version: '1.6.0'})}</p>
          </div>
        </Modal>

        <Modal show={isNewGameOpen} onClose={() => { setNewGameOpen(false); audioManager.playSound('click'); }} title={t('newGame')} theme={theme}>
            <div className="space-y-4">
                <div>
                    <label className="font-medium block mb-2">{t('gameMode')}</label>
                    <select
                        value={`${tempGameConfig.mode}-${tempGameConfig.size}`}
                        onChange={(e) => {
                            const [mode, sizeStr] = e.target.value.split('-');
                            const size = Number(sizeStr) as GameConfig['size'];
                            const newMode = mode as GameConfig['mode'];

                            const difficulties = ['Novice', 'Easy', 'Medium', 'Hard'] as const;
                            const firstAvailableDifficulty = difficulties.find(diff => 
                                hasPuzzles({ mode: newMode, size, difficulty: diff })
                            );
                            
                            setTempGameConfig({
                                mode: newMode,
                                size: size,
                                difficulty: firstAvailableDifficulty || tempGameConfig.difficulty
                            });
                        }}
                        className={`w-full p-3 rounded-lg border-2 ${theme.border} ${theme.cardBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        {GAME_MODES.map(gm => (
                            <option key={`${gm.mode}-${gm.size}`} value={`${gm.mode}-${gm.size}`}>{t(gm.nameKey)}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="font-medium block mb-2">{t('difficulty')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['Novice', 'Easy', 'Medium', 'Hard'] as const).map(diff => {
                            const isAvailable = hasPuzzles({
                                mode: tempGameConfig.mode,
                                size: tempGameConfig.size,
                                difficulty: diff
                            });
                            return (
                                <button 
                                    key={diff} 
                                    onClick={() => {
                                        if (isAvailable) {
                                            setTempGameConfig(c => ({...c, difficulty: diff}));
                                            audioManager.playSound('click');
                                        }
                                    }}
                                    disabled={!isAvailable}
                                    className={`p-3 rounded-lg font-bold transition-colors border-2 ${
                                        tempGameConfig.difficulty === diff 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : isAvailable 
                                                ? `${theme.button} border-transparent`
                                                : `${theme.button} border-transparent opacity-40 cursor-not-allowed`
                                    }`}
                                >
                                    {t(diff.toLowerCase())}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <button
                    onClick={() => startNewGame(tempGameConfig)}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white`}
                >
                    {t('play')}
                </button>
            </div>
        </Modal>

        <Modal show={isDuelSetupOpen} onClose={() => setDuelSetupOpen(false)} title={t('duelSetup')} theme={theme}>
            <div className="space-y-4">
                 <div>
                    <label className="font-medium block mb-2">{t('players')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {([2, 3, 4] as const).map(count => (
                            <button 
                                key={count}
                                onClick={() => {
                                    setTempDuelConfig(c => ({...c, playerCount: count, players: PLAYER_COLORS.slice(0, count).map(p => ({...p, score: 0}))}));
                                    audioManager.playSound('click');
                                }}
                                className={`p-3 rounded-lg font-bold transition-colors border-2 ${
                                    tempDuelConfig.playerCount === count
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : `${theme.button} border-transparent`
                                }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-medium">{t('playerOrder')}</label>
                        <button onClick={handleRandomizePlayers} className={`flex items-center gap-1 text-sm ${theme.button} py-1 px-2 rounded-md`}>
                            <Shuffle size={14} /> {t('randomize')}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {tempDuelConfig.players.map(player => {
                            const colorClass = playerColorClasses[player.color].bg;
                            return (
                                <div key={player.id} className={`p-3 rounded-lg ${theme.button} flex items-center space-x-3`}>
                                    <div className={`w-6 h-6 rounded-full ${colorClass}`}></div>
                                    <span className="font-bold">{t(player.nameKey)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                 <div>
                    <label className="font-medium block mb-2">{t('puzzleSize')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([6, 9] as const).map(size => (
                            <button 
                                key={size}
                                onClick={() => {
                                    setTempDuelConfig(c => ({...c, puzzleSize: size}));
                                    audioManager.playSound('click');
                                }}
                                className={`p-3 rounded-lg font-bold transition-colors border-2 ${
                                    tempDuelConfig.puzzleSize === size
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : `${theme.button} border-transparent`
                                }`}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className="font-medium block mb-2">{t('masterTime')}</label>
                        <select
                            value={tempDuelConfig.masterTimer}
                            onChange={e => setTempDuelConfig(c => ({...c, masterTimer: Number(e.target.value)}))}
                            className={`w-full p-2 rounded-lg border-2 ${theme.border} ${theme.cardBg}`}
                        >
                           <option value="180">3 {t('minutes')}</option>
                           <option value="300">5 {t('minutes')}</option>
                           <option value="600">10 {t('minutes')}</option>
                           <option value="900">15 {t('minutes')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="font-medium block mb-2">{t('turnTime')}</label>
                        <select
                            value={tempDuelConfig.turnTimer}
                            onChange={e => setTempDuelConfig(c => ({...c, turnTimer: Number(e.target.value)}))}
                            className={`w-full p-2 rounded-lg border-2 ${theme.border} ${theme.cardBg}`}
                        >
                           <option value="20">20 {t('seconds')}</option>
                           <option value="30">30 {t('seconds')}</option>
                           <option value="45">45 {t('seconds')}</option>
                           <option value="60">60 {t('seconds')}</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => startDuel(tempDuelConfig)}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white flex items-center justify-center gap-2`}
                >
                    <Swords /> {t('startDuel')}
                </button>
            </div>
        </Modal>

        <Modal show={isTurnReadyModalOpen} onClose={() => {}} title={t('turnReadyTitle')} theme={theme}>
            {currentDuelPlayer && (
                 <div className="space-y-4 text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto ${playerColorClasses[currentDuelPlayer.color].bg}`}></div>
                    <p className="text-xl font-bold">{t('getReady', { player: t(currentDuelPlayer.nameKey) })}</p>
                    <button
                        onClick={startPlayerTurn}
                        className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${playerColorClasses[currentDuelPlayer.color].bg} ${playerColorClasses[currentDuelPlayer.color].text}`}
                    >
                        {t('startTurn')}
                    </button>
                </div>
            )}
        </Modal>

        <Modal show={isDuelResultsOpen} onClose={() => setDuelResultsOpen(false)} title={t('duelResultsTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                 <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                 {duelState?.winner ? (
                     <p className='text-lg'>{t('duelWinner', { player: t(duelState.winner.nameKey) })}</p>
                 ) : (
                     <p className='text-lg'>{t('duelTimeUp')}</p>
                 )}
                 <div className='space-y-2 pt-4'>
                    {duelState?.players.sort((a,b) => b.score - a.score).map(p => (
                        <div key={p.id} className={`flex justify-between items-center p-2 rounded-lg ${theme.button}`}>
                            <div className='flex items-center space-x-2'>
                                <div className={`w-5 h-5 rounded-full ${playerColorClasses[p.color].bg}`}></div>
                                <span className='font-bold'>{t(p.nameKey)}</span>
                            </div>
                            <span className='font-bold text-lg'>{p.score}</span>
                        </div>
                    ))}
                 </div>
                 <button
                    onClick={() => {
                        if (lastDuelConfig.current) {
                           startDuel(lastDuelConfig.current);
                        } else {
                           setDuelSetupOpen(true);
                        }
                        audioManager.playSound('click');
                    }}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white`}
                >
                    {t('winPlayAgain')}
                </button>
            </div>
        </Modal>

        <Modal show={isWinModalOpen} onClose={() => { setWinModalOpen(false); audioManager.playSound('click'); }} title={t('winTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                <p className="text-lg">{t('winText')}</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <button
                    onClick={() => {
                        startNewGame(gameConfig);
                        audioManager.playSound('click');
                    }}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white`}
                >
                    {t('winPlayAgain')}
                </button>
            </div>
        </Modal>

      </div>
    </div>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <Game />
  </I18nProvider>
);

export default App;