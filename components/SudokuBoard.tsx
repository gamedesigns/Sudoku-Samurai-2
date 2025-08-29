import React from 'react';
import { Grid, Position, Theme, Cell, GameConfig, Hint } from '../types';

interface SudokuBoardProps {
  grid: Grid;
  gameConfig: GameConfig;
  selectedCell: Position | null;
  theme: Theme;
  highlightMode: boolean;
  onCellClick: (row: number, col: number) => void;
  incorrectCells: Set<string>;
  hint: Hint;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  gameConfig,
  selectedCell,
  theme,
  highlightMode,
  onCellClick,
  incorrectCells,
  hint,
}) => {
  const { size } = gameConfig;
  const boxRows = size === 9 ? 3 : 2;
  const boxCols = size / boxRows; // Correct calculation for all grid sizes

  const getCellClass = (row: number, col: number, cell: Cell): string => {
    const { value, isOriginal } = cell;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isIncorrect = incorrectCells.has(`${row}-${col}`);
    const isHinted = hint?.position[0] === row && hint?.position[1] === col;
    
    let isHighlighted = false;
    let isSameNumber = false;
    let isDiagonal = false;
    
    if (gameConfig.mode === 'X-Sudoku' && (row === col || row + col === size - 1)) {
        isDiagonal = true;
    }

    if (highlightMode && selectedCell) {
        const [selectedRow, selectedCol] = selectedCell;
        isHighlighted = (
            !isSelected &&
            (selectedRow === row ||
             selectedCol === col ||
             (Math.floor(selectedRow / boxRows) === Math.floor(row / boxRows) &&
              Math.floor(selectedCol / boxCols) === Math.floor(col / boxCols)))
        );
        const selectedValue = grid[selectedRow][selectedCol].value;
        if (selectedValue !== 0 && selectedValue === value) {
            isSameNumber = true;
        }
    }

    const baseClasses = `
      w-full aspect-square flex items-center justify-center font-bold
      transition-all duration-200 focus:outline-none relative
    `;
    
    const fontClasses = size === 9 ? 'text-xl sm:text-2xl' : size === 6 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg';

    const borderClasses = `
      border-t border-l ${theme.border}
      ${(col + 1) % boxCols === 0 ? `border-r-2 ${theme.borderThick}` : `border-r ${theme.border}`}
      ${(row + 1) % boxRows === 0 ? `border-b-2 ${theme.borderThick}` : `border-b ${theme.border}`}
      ${col === 0 ? `border-l-2 ${theme.borderThick}`: ''}
      ${row === 0 ? `border-t-2 ${theme.borderThick}`: ''}
    `;

    let stateClasses = '';
    if (isIncorrect) {
      stateClasses = theme.cellErrorBg;
    } else if (isSelected) {
      stateClasses = `${theme.cellSelected} text-white shadow-lg scale-105 z-10`;
    } else if (isSameNumber) {
      stateClasses = `${theme.cellHighlight}`;
    } else if (isHighlighted) {
      stateClasses = `${theme.cellHighlight}`;
    } else if (isDiagonal) {
        stateClasses = `${theme.cellHighlight} bg-opacity-50`
    } else if (value === 0) {
      stateClasses = theme.cellEmpty;
    } else {
      stateClasses = `${theme.cellBg}`;
    }

    let textClasses = '';
    if (isIncorrect) {
        textClasses = theme.cellErrorText;
    } else {
        textClasses = isOriginal ? theme.originalText : theme.userText;
    }
    
    let hintClasses = '';
    if (isHinted) {
        hintClasses = `ring-4 ${theme.cellHintBorder} z-20`;
    }

    return `${baseClasses} ${fontClasses} ${borderClasses} ${stateClasses} ${textClasses} ${hintClasses}`;
  };

  return (
    <div className={`w-full mx-auto ${theme.cardBg} rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 border-2 ${theme.borderThick}`}>
      <div 
        className="grid bg-transparent"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={cell.isOriginal}
              className={getCellClass(rowIndex, colIndex, cell)}
            >
              {cell.value !== 0 ? cell.value : (
                <div 
                    className={`grid w-full h-full items-center justify-center leading-none ${theme.noteText} pointer-events-none`}
                    style={{ gridTemplateColumns: `repeat(${boxRows}, 1fr)`}}
                >
                  {Array.from({ length: size }, (_, i) => i + 1).map(n => (
                    <div key={n} className="flex items-center justify-center" style={{ fontSize: size === 9 ? '10px' : '8px' }}>
                      {cell.notes.has(n) ? n : ''}
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;