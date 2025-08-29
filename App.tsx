import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Menu, X, Settings, Info, Palette, Sun, Moon, Award, BrainCircuit, Play } from 'lucide-react';
import { PUZZLES, MEDIUM_PUZZLE } from './constants';
import { lightTheme, darkTheme } from './themes';
import { Grid, Position, CellValue, Difficulty, Cell } from './types';
import { generateInitialGrid, checkWin, formatTime } from './utils';
import Modal from './components/Modal';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Header from './components/Header';

type GameState = 'new' | 'inprogress' | 'completed';
type InputMode = 'normal' | 'notes';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => generateInitialGrid(MEDIUM_PUZZLE));
  const [selectedCell, setSelectedCell] = useState<Position>(null);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isThemesOpen, setThemesOpen] = useState(false);
  const [isNewGameOpen, setNewGameOpen] = useState(false);
  const [isWinModalOpen, setWinModalOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [highlightMode, setHighlightMode] = useState(true);

  const [gameState, setGameState] = useState<GameState>('inprogress');
  const [time, setTime] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('normal');

  const theme = darkMode ? darkTheme : lightTheme;

  // Timer effect
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

  const startNewGame = useCallback((difficulty: Difficulty) => {
    setGrid(generateInitialGrid(PUZZLES[difficulty]));
    setSelectedCell(null);
    setGameState('inprogress');
    setTime(0);
    setInputMode('normal');
    setWinModalOpen(false);
    setNewGameOpen(false);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (grid[row][col].isOriginal) return;
    setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
  }, [grid]);

  const handleNumberClick = useCallback((number: CellValue) => {
    if (!selectedCell || gameState !== 'inprogress') return;
    
    const [row, col] = selectedCell;
    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)}))); // Deep copy
    const cell = newGrid[row][col];

    if (inputMode === 'notes') {
        if(cell.value === 0) { // Can only add notes to empty cells
            if (cell.notes.has(number)) {
                cell.notes.delete(number);
            } else {
                cell.notes.add(number);
            }
        }
    } else { // Normal mode
        cell.value = cell.value === number ? 0 : number;
        cell.notes.clear();
    }
    
    setGrid(newGrid);

    // Check for win condition after a number is placed
    if (inputMode === 'normal' && checkWin(newGrid)) {
        setGameState('completed');
        setWinModalOpen(true);
    }

  }, [selectedCell, grid, inputMode, gameState]);
  
  const handleDeleteClick = useCallback(() => {
    if (!selectedCell || gameState !== 'inprogress') return;

    const [row, col] = selectedCell;
    if (grid[row][col].isOriginal) return;

    const newGrid = grid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
    newGrid[row][col].value = 0; // Always clear the main value
    setGrid(newGrid);
  }, [selectedCell, grid, gameState]);

  const closeAllModals = () => {
      setSettingsOpen(false);
      setAboutOpen(false);
      setThemesOpen(false);
      setMenuOpen(false);
      setNewGameOpen(false);
  };
  
  const ModeToggle: React.FC = () => (
      <div className={`flex items-center justify-center p-1 rounded-full ${theme.cardBg} border-2 ${theme.border} shadow-inner`}>
          <button onClick={() => setInputMode('normal')} className={`px-4 py-2 w-28 text-sm font-bold rounded-full transition-all ${inputMode === 'normal' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              Number
          </button>
          <button onClick={() => setInputMode('notes')} className={`px-4 py-2 w-28 text-sm font-bold rounded-full transition-all ${inputMode === 'notes' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}>
              Notes
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
              <span>New Game</span>
            </button>
            <button
              onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { setThemesOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Palette className="w-5 h-5" />
              <span>Themes</span>
            </button>
            <button
              onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}
            >
              <Info className="w-5 h-5" />
              <span>About</span>
            </button>
          </div>
        )}

        <main className="flex-grow flex flex-col justify-center p-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="text-sm font-medium">Difficulty: Medium</div>
            <div className="text-lg font-semibold tabular-nums">{formatTime(time)}</div>
          </div>
          <SudokuBoard 
            grid={grid}
            selectedCell={selectedCell}
            theme={theme}
            highlightMode={highlightMode}
            onCellClick={handleCellClick}
          />
          <div className="flex flex-col items-center space-y-4">
            <ModeToggle />
            <NumberPad
              theme={theme}
              onNumberClick={handleNumberClick}
              onDeleteClick={handleDeleteClick}
            />
          </div>
        </main>
        
        {/* --- MODALS --- */}

        <Modal show={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Settings" theme={theme}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Highlight Mode</span>
              <button
                onClick={() => setHighlightMode(!highlightMode)}
                className={`w-12 h-6 rounded-full transition-colors ${highlightMode ? theme.toggleBgActive : theme.toggleBg} relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${highlightMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </Modal>

        <Modal show={isThemesOpen} onClose={() => setThemesOpen(false)} title="Themes" theme={theme}>
          <div className="space-y-3">
            <button
              onClick={() => { setDarkMode(false); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${!darkMode ? 'border-red-500 bg-red-50' : `border-transparent ${theme.button}`}`}
            >
              <Sun className={`w-5 h-5 ${!darkMode ? 'text-red-500' : theme.text}`} />
              <span className={`${!darkMode ? 'text-red-700' : theme.text}`}>Light Theme</span>
            </button>
            <button
              onClick={() => { setDarkMode(true); closeAllModals(); }}
              className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${darkMode ? 'border-blue-500 bg-blue-900/20' : `border-transparent ${theme.button}`}`}
            >
              <Moon className={`w-5 h-5 ${darkMode ? 'text-blue-500' : theme.text}`} />
              <span className={`${darkMode ? 'text-blue-300' : theme.text}`}>Dark Theme</span>
            </button>
          </div>
        </Modal>

        <Modal show={isAboutOpen} onClose={() => setAboutOpen(false)} title="About Sudoku Samurai" theme={theme}>
          <div className="space-y-4 text-sm">
            <p>Embrace the way of the samurai with intuitive controls, elegant design, and a sharp focus on the classic logic puzzle.</p>
            <p className="text-xs opacity-70">Version 0.2.0 • Created by Daniel Sandner</p>
          </div>
        </Modal>

        <Modal show={isNewGameOpen} onClose={() => setNewGameOpen(false)} title="New Game" theme={theme}>
            <div className="space-y-3 text-center">
                <p className="mb-4">Select a difficulty to start a new puzzle.</p>
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                    <button key={diff} onClick={() => startNewGame(diff)} className={`w-full p-4 rounded-xl font-bold transition-colors ${theme.button}`}>
                        {diff}
                    </button>
                ))}
            </div>
        </Modal>

        <Modal show={isWinModalOpen} onClose={() => setWinModalOpen(false)} title="Congratulations!" theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                <p className="text-lg">You solved the puzzle!</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <p className="pt-4">Play another round?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                        <button key={diff} onClick={() => startNewGame(diff)} className={`w-full p-3 rounded-xl font-bold transition-colors ${theme.button}`}>
                            {diff}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>

      </div>
    </div>
  );
};

export default App;
