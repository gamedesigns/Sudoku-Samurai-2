import React, { useState, useCallback, useEffect } from 'react';
import { Menu, X, Settings, Info, Palette, Sun, Moon, Award, Play, RefreshCw, Lightbulb, Flame } from 'lucide-react';

import { getRandomPuzzle, hasPuzzles } from './constants';
import { lightTheme, darkTheme, warmTheme } from './themes';
import { Grid, Position, CellValue, Cell, GameConfig, Hint, Difficulty, AppSettings, ThemeName } from './types';
import { generateInitialGrid, checkWin, formatTime, solveSudoku } from './utils';
import { findHint } from './solver/techniques';

import Modal from './components/Modal';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Header from './components/Header';
import HintTutor from './components/HintTutor';

import { useLocalStorage } from './hooks/useLocalStorage';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { DEFAULT_SETTINGS, LANGUAGES, GAME_MODES, DEFAULT_GAME_CONFIG } from './config';


type GameState = 'new' | 'inprogress' | 'completed';
type InputMode = 'normal' | 'notes';

const Game: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('sudokuSettings', DEFAULT_SETTINGS);
  const { theme: themeName, highlightMode, language, mistakeChecker, gameConfig, startFullscreen } = settings;
  const { t, setLang, lang } = useI18n();

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

  const [gameState, setGameState] = useState<GameState>('new');
  const [time, setTime] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('normal');
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<Hint>(null);
  
  const [tempGameConfig, setTempGameConfig] = useState<GameConfig>(gameConfig);

  const themes = { light: lightTheme, warm: warmTheme, dark: darkTheme };
  const theme = themes[themeName];

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
  
  useEffect(() => {
    startNewGame(gameConfig, false); // Don't request fullscreen on initial load
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewGame = useCallback((newConfig: GameConfig, requestFS: boolean = true) => {
    if (requestFS && startFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    }
    const puzzle = getRandomPuzzle(newConfig);
    if (!puzzle) {
        console.error("No puzzle found for this configuration:", newConfig);
        alert(t('noPuzzleError'));
        return;
    }
    const initialGrid = generateInitialGrid(puzzle, newConfig);
    setGrid(initialGrid);
    setSolvedGrid(solveSudoku(initialGrid, newConfig));
    setSettings(s => ({ ...s, gameConfig: newConfig}));
    setSelectedCell(null);
    setGameState('inprogress');
    setTime(0);
    setInputMode('normal');
    setWinModalOpen(false);
    setNewGameOpen(false);
    setIncorrectCells(new Set());
    setHint(null);
  }, [setSettings, t, startFullscreen]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!grid || grid[row][col].isOriginal) return;
    setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
  }, [grid]);
  
  const checkMistakes = useCallback((currentGrid: Grid) => {
    if (!mistakeChecker || !solvedGrid) {
        setIncorrectCells(new Set());
        return;
    }
    const newIncorrectCells = new Set<string>();
    const size = currentGrid.length;
    for(let r=0; r < size; r++) {
        for (let c=0; c < size; c++) {
            const cell = currentGrid[r][c];
            if (!cell.isOriginal && cell.value !== 0 && cell.value !== solvedGrid[r][c].value) {
                newIncorrectCells.add(`${r}-${c}`);
            }
        }
    }
    setIncorrectCells(newIncorrectCells);
  }, [mistakeChecker, solvedGrid]);

  const handleNumberClick = useCallback((number: CellValue) => {
    if (!selectedCell || !grid || gameState !== 'inprogress') return;
    setHint(null);
    
    const [row, col] = selectedCell;
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)}))); 
    const cell = newGrid[row][col];

    if (inputMode === 'notes') {
        if(cell.value === 0) {
            if (cell.notes.has(number)) {
                cell.notes.delete(number);
            } else {
                cell.notes.add(number);
            }
        }
    } else {
        cell.value = cell.value === number ? 0 : number;
        cell.notes.clear();
    }
    
    setGrid(newGrid);
    checkMistakes(newGrid);

    if (inputMode === 'normal' && checkWin(newGrid, gameConfig)) {
        setGameState('completed');
        setWinModalOpen(true);
    }

  }, [selectedCell, grid, inputMode, gameState, checkMistakes, gameConfig]);
  
  const handleDeleteClick = useCallback(() => {
    if (!selectedCell || !grid || gameState !== 'inprogress') return;

    const [row, col] = selectedCell;
    if (grid[row][col].isOriginal) return;
    
    setHint(null);
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = 0;
    setGrid(newGrid);
    checkMistakes(newGrid);
  }, [selectedCell, grid, gameState, checkMistakes]);

  const revealHint = useCallback(() => {
    if (!hint || !grid || !solvedGrid) return;

    const [row, col] = hint.position;
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = solvedGrid[row][col].value;
    newGrid[row][col].notes.clear();
    setGrid(newGrid);
    checkMistakes(newGrid);
    setHint(null);
    if (checkWin(newGrid, gameConfig)) {
        setGameState('completed');
        setWinModalOpen(true);
    }
  }, [hint, grid, solvedGrid, checkMistakes, gameConfig]);
  
  const handleHintClick = useCallback(() => {
    if (gameState !== 'inprogress' || !grid) return;

    if (hint && hint.stage === 'nudge') {
        setHint({ ...hint, stage: 'tutor'});
    } else {
        const foundHint = findHint(grid, gameConfig);
        if (foundHint) {
            setHint({ ...foundHint, stage: 'nudge' });
            setSelectedCell(foundHint.position);
        } else {
            console.log("No simple hint available.");
        }
    }
  }, [gameState, grid, hint, gameConfig]);

  const closeAllModals = () => {
      setSettingsOpen(false);
      setAboutOpen(false);
      setThemesOpen(false);
      setMenuOpen(false);
      setNewGameOpen(false);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    startNewGame(DEFAULT_GAME_CONFIG);
    closeAllModals();
  };
  
  const ModeToggle: React.FC = () => (
      <div className={`flex items-center justify-center p-1 rounded-full ${theme.cardBg} border-2 ${theme.border} shadow-inner`}>
          <button onClick={() => setInputMode('normal')} className={`px-4 py-2 w-28 text-sm font-bold rounded-full transition-all ${inputMode === 'normal' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              {t('number')}
          </button>
          <button onClick={() => setInputMode('notes')} className={`px-4 py-2 w-28 text-sm font-bold rounded-full transition-all ${inputMode === 'notes' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              {t('notes')}
          </button>
      </div>
  );

  if (!grid) {
      return <div>Loading...</div>; // Or a proper loading screen
  }

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <div className="relative max-w-5xl mx-auto flex flex-col min-h-screen">
        <Header theme={theme} isMenuOpen={isMenuOpen} onMenuToggle={() => setMenuOpen(!isMenuOpen)} />

        {isMenuOpen && (
          <div className={`absolute top-20 right-4 ${theme.cardBg} rounded-2xl shadow-xl z-50 border-2 ${theme.border} overflow-hidden w-48`}>
             <button
              onClick={() => { setTempGameConfig(gameConfig); setNewGameOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Play className="w-5 h-5" />
              <span>{t('newGame')}</span>
            </button>
            <button
              onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Settings className="w-5 h-5" />
              <span>{t('settings')}</span>
            </button>
            <button
              onClick={() => { setThemesOpen(true); setMenuOpen(false); }}
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
              onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Info className="w-5 h-5" />
              <span>{t('about')}</span>
            </button>
          </div>
        )}

        <main className="flex-grow flex flex-col justify-center p-2 sm:p-4">
          <div className="flex justify-between items-center px-2 max-w-md mx-auto w-full">
            <div className="text-sm font-medium">{t(gameConfig.mode)} • {t(gameConfig.difficulty.toLowerCase())}</div>
            <div className="text-lg font-semibold tabular-nums">{formatTime(time)}</div>
          </div>
          <div className="game-layout flex flex-col items-center flex-grow justify-center">
            <div className="board-wrapper w-full max-w-md">
                <SudokuBoard 
                    grid={grid}
                    gameConfig={gameConfig}
                    selectedCell={selectedCell}
                    theme={theme}
                    highlightMode={highlightMode}
                    onCellClick={handleCellClick}
                    incorrectCells={incorrectCells}
                    hint={hint}
                />
            </div>
            <div className="controls-wrapper mt-4 w-full max-w-md flex flex-col items-center space-y-4">
              <ModeToggle />
              <div className="flex items-stretch w-full space-x-2 sm:space-x-3">
                <NumberPad
                  theme={theme}
                  gameConfig={gameConfig}
                  onNumberClick={handleNumberClick}
                  onDeleteClick={handleDeleteClick}
                />
                <button onClick={handleHintClick} className={`h-auto aspect-square rounded-lg sm:rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} hover:scale-105 active:scale-95`}>
                  <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>
            </div>
          </div>
        </main>
        
        {hint && hint.stage === 'tutor' && (
            <HintTutor hint={hint} theme={theme} onClose={() => setHint(null)} onReveal={revealHint} />
        )}

        <Modal show={isSettingsOpen} onClose={() => setSettingsOpen(false)} title={t('settings')} theme={theme}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('highlightMode')}</span>
              <button
                onClick={() => setSettings(s => ({ ...s, highlightMode: !s.highlightMode }))}
                className={`w-12 h-6 rounded-full transition-colors ${highlightMode ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${highlightMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('mistakeChecker')}</span>
              <button
                onClick={() => setSettings(s => ({ ...s, mistakeChecker: !s.mistakeChecker }))}
                className={`w-12 h-6 rounded-full transition-colors ${mistakeChecker ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${mistakeChecker ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">{t('startFullscreen')}</span>
              <button
                onClick={() => setSettings(s => ({ ...s, startFullscreen: !s.startFullscreen }))}
                className={`w-12 h-6 rounded-full transition-colors ${startFullscreen ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${startFullscreen ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <span className="font-medium block mb-2">{t('language')}</span>
              <div className="flex space-x-2">
                {LANGUAGES.map(({ code, name }) => (
                    <button key={code} onClick={() => setSettings(s => ({...s, language: code}))} className={`w-full p-2 text-sm rounded-lg font-semibold border-2 transition-colors ${language === code ? `border-blue-500 ${lightTheme.cellHighlight} ${lightTheme.userText}` : `border-transparent ${theme.button}`}`}>
                        {name}
                    </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        <Modal show={isThemesOpen} onClose={() => setThemesOpen(false)} title={t('themes')} theme={theme}>
          <div className="space-y-3">
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'light'})); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'light' ? `border-blue-500 ${lightTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
            >
              <Sun className={`w-5 h-5 ${themeName === 'light' ? 'text-blue-500' : theme.text}`} />
              <span className={`${themeName === 'light' ? lightTheme.userText : theme.text}`}>{t('lightTheme')}</span>
            </button>
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'warm'})); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'warm' ? `border-red-500 ${warmTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
            >
              <Flame className={`w-5 h-5 ${themeName === 'warm' ? 'text-red-500' : theme.text}`} />
              <span className={`${themeName === 'warm' ? warmTheme.userText : theme.text}`}>{t('warmTheme')}</span>
            </button>
            <button
              onClick={() => { setSettings(s => ({...s, theme: 'dark'})); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'dark' ? 'border-blue-500 bg-blue-900/20' : `border-transparent ${theme.button}`}`}
            >
              <Moon className={`w-5 h-5 ${themeName === 'dark' ? 'text-blue-500' : theme.text}`} />
              <span className={`${themeName === 'dark' ? 'text-blue-300' : theme.text}`}>{t('darkTheme')}</span>
            </button>
          </div>
        </Modal>

        <Modal show={isAboutOpen} onClose={() => setAboutOpen(false)} title={t('aboutTitle')} theme={theme}>
          <div className="space-y-4 text-sm">
            <p>{t('aboutText1')}</p>
            <p className="text-xs opacity-70">{t('aboutVersion', {version: '0.5.0'})}</p>
          </div>
        </Modal>

        <Modal show={isNewGameOpen} onClose={() => setNewGameOpen(false)} title={t('newGame')} theme={theme}>
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

        <Modal show={isWinModalOpen} onClose={() => setWinModalOpen(false)} title={t('winTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                <p className="text-lg">{t('winText')}</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <button
                    onClick={() => setNewGameOpen(true)}
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