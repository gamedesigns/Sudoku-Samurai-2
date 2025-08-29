import React, { useState, useCallback, useEffect } from 'react';
import { Menu, X, Settings, Info, Palette, Sun, Moon, Award, Play, RefreshCw, Lightbulb } from 'lucide-react';

import { PUZZLES } from './constants';
import { lightTheme, darkTheme } from './themes';
import { Grid, Position, CellValue, Difficulty, Cell } from './types';
import { generateInitialGrid, checkWin, formatTime, solveSudoku } from './utils';

import Modal from './components/Modal';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Header from './components/Header';

import { useLocalStorage } from './hooks/useLocalStorage';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { DEFAULT_SETTINGS, LANGUAGES, AppSettings } from './config';


type GameState = 'new' | 'inprogress' | 'completed';
type InputMode = 'normal' | 'notes';

const getRandomPuzzle = (difficulty: Difficulty): CellValue[][] => {
  const puzzleSet = PUZZLES[difficulty];
  return puzzleSet[Math.floor(Math.random() * puzzleSet.length)];
};

const Game: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('sudokuSettings', DEFAULT_SETTINGS);
  const { darkMode, highlightMode, language, mistakeChecker } = settings;
  const { t, setLang, lang } = useI18n();

  useEffect(() => {
    if (lang !== language) {
      setLang(language);
    }
  }, [language, lang, setLang]);
  
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [grid, setGrid] = useState<Grid>(() => generateInitialGrid(getRandomPuzzle(difficulty)));
  const [solvedGrid, setSolvedGrid] = useState<Grid | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position>(null);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isThemesOpen, setThemesOpen] = useState(false);
  const [isNewGameOpen, setNewGameOpen] = useState(false);
  const [isWinModalOpen, setWinModalOpen] = useState(false);

  const [gameState, setGameState] = useState<GameState>('inprogress');
  const [time, setTime] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('normal');
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<Position>(null);

  const theme = darkMode ? darkTheme : lightTheme;

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
    startNewGame(difficulty);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewGame = useCallback((newDifficulty: Difficulty) => {
    const puzzle = getRandomPuzzle(newDifficulty);
    const initialGrid = generateInitialGrid(puzzle);
    setGrid(initialGrid);
    setSolvedGrid(solveSudoku(initialGrid));
    setDifficulty(newDifficulty);
    setSelectedCell(null);
    setGameState('inprogress');
    setTime(0);
    setInputMode('normal');
    setWinModalOpen(false);
    setNewGameOpen(false);
    setIncorrectCells(new Set());
    setHint(null);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (grid[row][col].isOriginal) return;
    setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
  }, [grid]);
  
  const checkMistakes = useCallback((currentGrid: Grid) => {
    if (!mistakeChecker || !solvedGrid) return;
    const newIncorrectCells = new Set<string>();
    for(let r=0; r<9; r++) {
        for (let c=0; c<9; c++) {
            const cell = currentGrid[r][c];
            if (!cell.isOriginal && cell.value !== 0 && cell.value !== solvedGrid[r][c].value) {
                newIncorrectCells.add(`${r}-${c}`);
            }
        }
    }
    setIncorrectCells(newIncorrectCells);
  }, [mistakeChecker, solvedGrid]);

  const handleNumberClick = useCallback((number: CellValue) => {
    if (!selectedCell || gameState !== 'inprogress') return;
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

    if (inputMode === 'normal' && checkWin(newGrid)) {
        setGameState('completed');
        setWinModalOpen(true);
    }

  }, [selectedCell, grid, inputMode, gameState, checkMistakes]);
  
  const handleDeleteClick = useCallback(() => {
    if (!selectedCell || gameState !== 'inprogress') return;

    const [row, col] = selectedCell;
    if (grid[row][col].isOriginal) return;
    
    setHint(null);
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = 0;
    setGrid(newGrid);
    checkMistakes(newGrid);
  }, [selectedCell, grid, gameState, checkMistakes]);
  
  const handleHintClick = useCallback(() => {
    if (gameState !== 'inprogress' || !solvedGrid) return;

    if (hint) {
        const [row, col] = hint;
        const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
        newGrid[row][col].value = solvedGrid[row][col].value;
        newGrid[row][col].notes.clear();
        setGrid(newGrid);
        checkMistakes(newGrid);
        setHint(null);
        setSelectedCell(hint);
        if (checkWin(newGrid)) {
            setGameState('completed');
            setWinModalOpen(true);
        }
        return;
    }

    const emptyCells: [number, number][] = [];
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if(grid[r][c].value === 0) {
                emptyCells.push([r,c]);
            }
        }
    }

    if(emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        setHint(randomCell);
        setSelectedCell(randomCell);
    }
  }, [gameState, solvedGrid, grid, hint, checkMistakes]);

  const closeAllModals = () => {
      setSettingsOpen(false);
      setAboutOpen(false);
      setThemesOpen(false);
      setMenuOpen(false);
      setNewGameOpen(false);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
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

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <div className="relative max-w-lg mx-auto flex flex-col min-h-screen">
        <Header theme={theme} isMenuOpen={isMenuOpen} onMenuToggle={() => setMenuOpen(!isMenuOpen)} />

        {isMenuOpen && (
          <div className={`absolute top-20 right-4 ${theme.cardBg} rounded-2xl shadow-xl z-40 border-2 ${theme.border} overflow-hidden w-48`}>
             <button
              onClick={() => { setNewGameOpen(true); setMenuOpen(false); }}
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

        <main className="flex-grow flex flex-col justify-center p-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="text-sm font-medium">{t('difficulty')}: {t(difficulty.toLowerCase())}</div>
            <div className="text-lg font-semibold tabular-nums">{formatTime(time)}</div>
          </div>
          <SudokuBoard 
            grid={grid}
            selectedCell={selectedCell}
            theme={theme}
            highlightMode={highlightMode}
            onCellClick={handleCellClick}
            incorrectCells={incorrectCells}
            hint={hint}
          />
          <div className="flex flex-col items-center space-y-4">
            <ModeToggle />
            <div className="flex items-center w-full max-w-md mx-auto space-x-2 sm:space-x-3">
              <NumberPad
                theme={theme}
                onNumberClick={handleNumberClick}
                onDeleteClick={handleDeleteClick}
              />
              <button onClick={handleHintClick} className={`h-full aspect-square rounded-lg sm:rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} hover:scale-105 active:scale-95`}>
                <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>
        </main>
        
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
            <div>
              <span className="font-medium block mb-2">{t('language')}</span>
              <div className="flex space-x-2">
                {LANGUAGES.map(({ code, name }) => (
                    <button key={code} onClick={() => setSettings(s => ({...s, language: code}))} className={`w-full p-2 text-sm rounded-lg font-semibold border-2 transition-colors ${language === code ? 'border-red-500 bg-red-50' : `border-transparent ${theme.button}`}`}>
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
              onClick={() => { setSettings(s => ({...s, darkMode: false})); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${!darkMode ? 'border-red-500 bg-red-50' : `border-transparent ${theme.button}`}`}
            >
              <Sun className={`w-5 h-5 ${!darkMode ? 'text-red-500' : theme.text}`} />
              <span className={`${!darkMode ? 'text-red-700' : theme.text}`}>{t('lightTheme')}</span>
            </button>
            <button
              onClick={() => { setSettings(s => ({...s, darkMode: true})); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${darkMode ? 'border-blue-500 bg-blue-900/20' : `border-transparent ${theme.button}`}`}
            >
              <Moon className={`w-5 h-5 ${darkMode ? 'text-blue-500' : theme.text}`} />
              <span className={`${darkMode ? 'text-blue-300' : theme.text}`}>{t('darkTheme')}</span>
            </button>
          </div>
        </Modal>

        <Modal show={isAboutOpen} onClose={() => setAboutOpen(false)} title={t('aboutTitle')} theme={theme}>
          <div className="space-y-4 text-sm">
            <p>{t('aboutText1')}</p>
            <p className="text-xs opacity-70">{t('aboutVersion', {version: '0.3.0'})}</p>
          </div>
        </Modal>

        <Modal show={isNewGameOpen} onClose={() => setNewGameOpen(false)} title={t('newGame')} theme={theme}>
            <div className="space-y-3 text-center">
                <p className="mb-4">{t('newGameText')}</p>
                {(['Novice', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                    <button key={diff} onClick={() => startNewGame(diff)} className={`w-full p-4 rounded-xl font-bold transition-colors ${theme.button}`}>
                        {t(diff.toLowerCase())}
                    </button>
                ))}
            </div>
        </Modal>

        <Modal show={isWinModalOpen} onClose={() => setWinModalOpen(false)} title={t('winTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                <p className="text-lg">{t('winText')}</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <p className="pt-4">{t('winPlayAgain')}</p>
                <div className="grid grid-cols-2 gap-2">
                    {(['Novice', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                        <button key={diff} onClick={() => startNewGame(diff)} className={`w-full p-3 rounded-xl font-bold transition-colors ${theme.button}`}>
                            {t(diff.toLowerCase())}
                        </button>
                    ))}
                </div>
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