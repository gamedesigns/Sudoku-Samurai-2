import React from 'react';
import { Grid, Position, Theme, Cell } from '../types';

interface SudokuBoardProps {
  grid: Grid;
  selectedCell: Position;
  theme: Theme;
  highlightMode: boolean;
  onCellClick: (row: number, col: number) => void;
  incorrectCells: Set<string>;
  hint: Position;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  selectedCell,
  theme,
  highlightMode,
  onCellClick,
  incorrectCells,
  hint,
}) => {
  const getCellClass = (row: number, col: number, cell: Cell): string => {
    const { value, isOriginal } = cell;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isIncorrect = incorrectCells.has(`${row}-${col}`);
    const isHinted = hint?.[0] === row && hint?.[1] === col;
    
    let isHighlighted = false;
    let isSameNumber = false;
    
    if (highlightMode && selectedCell) {
        const [selectedRow, selectedCol] = selectedCell;
        isHighlighted = (
            !isSelected &&
            (selectedRow === row ||
             selectedCol === col ||
             (Math.floor(selectedRow / 3) === Math.floor(row / 3) &&
              Math.floor(selectedCol / 3) === Math.floor(col / 3)))
        );
        const selectedValue = grid[selectedRow][selectedCol].value;
        if (selectedValue !== 0 && selectedValue === value) {
            isSameNumber = true;
        }
    }

    const baseClasses = `
      w-full aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold
      transition-all duration-200 focus:outline-none relative
    `;

    const borderClasses = `
      ${col % 3 === 2 && col !== 8 ? `border-r-2 ${theme.borderThick}` : `border-r ${theme.border}`}
      ${row % 3 === 2 && row !== 8 ? `border-b-2 ${theme.borderThick}` : `border-b ${theme.border}`}
      ${col === 0 ? `border-l-2 ${theme.borderThick}` : `border-l ${theme.border}`}
      ${row === 0 ? `border-t-2 ${theme.borderThick}` : `border-t ${theme.border}`}
    `;

    let stateClasses = '';
    if (isIncorrect) {
      stateClasses = theme.cellErrorBg;
    } else if (isSelected) {
      stateClasses = `${theme.cellSelected} text-white shadow-lg scale-105 z-10`;
    } else if (isSameNumber) {
      stateClasses = `${theme.cellSelected} bg-opacity-70`;
    } else if (isHighlighted) {
      stateClasses = `${theme.cellHighlight}`;
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

    return `${baseClasses} ${borderClasses} ${stateClasses} ${textClasses} ${hintClasses}`;
  };

  return (
    <div className={`w-full max-w-md mx-auto ${theme.cardBg} rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 border-2 ${theme.borderThick}`}>
      <div className="grid grid-cols-9 bg-transparent">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={cell.isOriginal}
              className={getCellClass(rowIndex, colIndex, cell)}
            >
              {cell.value !== 0 ? cell.value : (
                <div className={`grid grid-cols-3 w-full h-full text-[10px] sm:text-xs items-center justify-center leading-none ${theme.noteText} pointer-events-none`}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                    <div key={n} className="flex items-center justify-center">
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