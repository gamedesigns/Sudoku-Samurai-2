
import React, { useState, useCallback } from 'react';
import { Menu, X, Settings, Info, Palette, Sun, Moon } from 'lucide-react';
import { INITIAL_GRID } from './constants';
import { lightTheme, darkTheme } from './themes';
import { Grid, Position, CellValue } from './types';
import Modal from './components/Modal';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import Header from './components/Header';

const App: React.FC = () => {
  const [originalGrid] = useState<Grid>(INITIAL_GRID);
  const [grid, setGrid] = useState<Grid>(JSON.parse(JSON.stringify(INITIAL_GRID)));
  const [selectedCell, setSelectedCell] = useState<Position>(null);
  const [selectedNumber, setSelectedNumber] = useState<CellValue | null>(null);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isThemesOpen, setThemesOpen] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [highlightMode, setHighlightMode] = useState(true);

  const theme = darkMode ? darkTheme : lightTheme;

  const handleCellClick = useCallback((row: number, col: number) => {
    if (originalGrid[row][col] !== 0) return;

    if (selectedNumber) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = selectedNumber;
      setGrid(newGrid as Grid);
      setSelectedNumber(null);
      setSelectedCell([row, col]);
    } else {
      setSelectedCell(p => p && p[0] === row && p[1] === col ? null : [row, col]);
    }
  }, [selectedNumber, grid, originalGrid]);

  const handleNumberClick = useCallback((number: CellValue) => {
    if (selectedCell && originalGrid[selectedCell[0]][selectedCell[1]] === 0) {
      const newGrid = grid.map(r => [...r]);
      newGrid[selectedCell[0]][selectedCell[1]] = number;
      setGrid(newGrid as Grid);
    } else {
      setSelectedNumber(n => n === number ? null : number);
      setSelectedCell(null);
    }
  }, [selectedCell, grid, originalGrid]);

  const handleDeleteClick = useCallback(() => {
    if (selectedCell && originalGrid[selectedCell[0]][selectedCell[1]] === 0) {
      const newGrid = grid.map(r => [...r]);
      newGrid[selectedCell[0]][selectedCell[1]] = 0;
      setGrid(newGrid as Grid);
    }
  }, [selectedCell, grid, originalGrid]);
  
  const closeAllModals = () => {
      setSettingsOpen(false);
      setAboutOpen(false);
      setThemesOpen(false);
      setMenuOpen(false);
  };

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      <div className="relative max-w-lg mx-auto flex flex-col min-h-screen">
        <Header theme={theme} isMenuOpen={isMenuOpen} onMenuToggle={() => setMenuOpen(!isMenuOpen)} />

        {isMenuOpen && (
          <div className={`absolute top-20 right-4 ${theme.cardBg} rounded-2xl shadow-xl z-40 border-2 ${theme.border} overflow-hidden w-48`}>
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

        <main className="flex-grow flex flex-col justify-center p-4 space-y-6">
          <SudokuBoard 
            grid={grid}
            originalGrid={originalGrid}
            selectedCell={selectedCell}
            theme={theme}
            highlightMode={highlightMode}
            onCellClick={handleCellClick}
          />
          <NumberPad
            selectedNumber={selectedNumber}
            theme={theme}
            onNumberClick={handleNumberClick}
            onDeleteClick={handleDeleteClick}
          />
        </main>

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
            <p className="text-xs opacity-70">Version 0.1.0 • Created by Daniel Sandner</p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default App;
