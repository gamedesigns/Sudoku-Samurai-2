
import React from 'react';
import { Grid, Position, Theme } from '../types';

interface SudokuBoardProps {
  grid: Grid;
  originalGrid: Grid;
  selectedCell: Position;
  theme: Theme;
  highlightMode: boolean;
  onCellClick: (row: number, col: number) => void;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  originalGrid,
  selectedCell,
  theme,
  highlightMode,
  onCellClick,
}) => {
  const getCellClass = (row: number, col: number): string => {
    const value = grid[row][col];
    const isOriginal = originalGrid[row][col] !== 0;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    
    let isHighlighted = false;
    let isSameNumber = false;
    
    if (highlightMode && selectedCell) {
        const [selectedRow, selectedCol] = selectedCell;
        isHighlighted = (
            selectedRow === row ||
            selectedCol === col ||
            (Math.floor(selectedRow / 3) === Math.floor(row / 3) &&
             Math.floor(selectedCol / 3) === Math.floor(col / 3))
        );
        const selectedValue = grid[selectedRow][selectedCol];
        if (selectedValue !== 0 && selectedValue === value) {
            isSameNumber = true;
        }
    }

    const baseClasses = `
      w-full aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold
      transition-all duration-200 focus:outline-none
    `;

    const borderClasses = `
      ${col % 3 === 2 && col !== 8 ? `border-r-2 ${theme.borderThick}` : `border-r ${theme.border}`}
      ${row % 3 === 2 && row !== 8 ? `border-b-2 ${theme.borderThick}` : `border-b ${theme.border}`}
      ${col === 0 ? `border-l-2 ${theme.borderThick}` : `border-l ${theme.border}`}
      ${row === 0 ? `border-t-2 ${theme.borderThick}` : `border-t ${theme.border}`}
    `;

    let stateClasses = '';
    if (isSelected) {
      stateClasses = `${theme.cellSelected} text-white shadow-lg scale-105 z-10`;
    } else if (isSameNumber) {
      stateClasses = `${theme.cellSelected} bg-opacity-70`;
    } else if (isHighlighted) {
      stateClasses = `${theme.cellHighlight}`;
    } else if (value === 0) {
      stateClasses = `${theme.cellEmpty} ${!isOriginal ? 'cursor-pointer' : ''}`;
    } else {
      stateClasses = `${theme.cellBg}`;
    }

    const textClasses = isOriginal ? theme.originalText : theme.userText;

    return `${baseClasses} ${borderClasses} ${stateClasses} ${textClasses}`;
  };

  return (
    <div className={`w-full max-w-md mx-auto ${theme.cardBg} rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 border-2 ${theme.borderThick}`}>
      <div className="grid grid-cols-9 bg-transparent">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              disabled={originalGrid[rowIndex][colIndex] !== 0}
              className={getCellClass(rowIndex, colIndex)}
            >
              {cell !== 0 ? cell : ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;
