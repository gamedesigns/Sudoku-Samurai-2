import React from 'react';
import { Grid, Position, Theme, Cell, GameConfig, Hint, DisplayMode, DuelState, PlayerColor } from '../types';
import { COLOR_MAP, LETTER_MAP, JAPANESE_NUMBER_MAP, KIDS_ICON_MAP } from '../constants';

interface SudokuBoardProps {
  grid: Grid;
  gameConfig: GameConfig;
  displayMode: DisplayMode;
  selectedCell: Position | null;
  dragTargetCell: Position | null;
  dragOriginCell: Position | null;
  theme: Theme;
  highlightMode: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellDragStart: (row: number, col: number) => void;
  incorrectCells: Set<string>;
  hint: Hint;
  phistomefelRing: boolean;
  duelState?: DuelState | null;
}

const playerColorClasses: Record<PlayerColor, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    violet: 'bg-violet-500',
};

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  gameConfig,
  displayMode,
  selectedCell,
  dragTargetCell,
  dragOriginCell,
  theme,
  highlightMode,
  onCellClick,
  onCellDragStart,
  incorrectCells,
  hint,
  phistomefelRing,
  duelState,
}) => {
  const { size, mode } = gameConfig;
  const boxRows = size === 9 ? 3 : 2;
  const boxCols = size / boxRows;

  const getCellClass = (row: number, col: number, cell: Cell): string => {
    const { value, isOriginal } = cell;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isDragTarget = dragTargetCell?.[0] === row && dragTargetCell?.[1] === col;
    const isDragOrigin = dragOriginCell?.[0] === row && dragOriginCell?.[1] === col;
    const isIncorrect = incorrectCells.has(`${row}-${col}`);
    const isHinted = hint?.position[0] === row && hint?.position[1] === col;
    
    let isHighlighted = false;
    let isSameNumber = false;
    let isDiagonal = false;
    let isHyperBox = false;
    let isPhistoCorner = false;
    let isPhistoCenter = false;
    
    if (gameConfig.mode === 'X-Sudoku' && (row === col || row + col === size - 1)) {
        isDiagonal = true;
    }
    
    if (gameConfig.mode === 'Hyper Sudoku' && size === 9) {
        if ((row >= 1 && row <= 3 && col >= 1 && col <= 3) ||
            (row >= 1 && row <= 3 && col >= 5 && col <= 7) ||
            (row >= 5 && row <= 7 && col >= 1 && col <= 3) ||
            (row >= 5 && row <= 7 && col >= 5 && col <= 7)) {
            isHyperBox = true;
        }
    }

    if (phistomefelRing && size === 9) {
        const isCornerRow = row <= 1 || row >= 7;
        const isCornerCol = col <= 1 || col >= 7;
        if (isCornerRow && isCornerCol) {
            isPhistoCorner = true;
        }

        const isCenterRingRow = (row === 2 || row === 6) && (col >= 2 && col <= 6);
        const isCenterRingCol = (col === 2 || col === 6) && (row >= 2 && row <= 6);
        if (isCenterRingRow || isCenterRingCol) {
            isPhistoCenter = true;
        }
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
    if (isIncorrect && displayMode !== 'color') {
      stateClasses = theme.cellErrorBg;
    } else if (isDragTarget) {
      stateClasses = `${theme.cellDragTarget} scale-105`;
    } else if (isSelected) {
      stateClasses = `${theme.cellSelected} text-white shadow-lg scale-105`;
    } else if (isDragOrigin) {
      stateClasses = theme.cellBeingMoved;
    } else if (isSameNumber && displayMode !== 'color') {
      stateClasses = `${theme.cellHighlight}`;
    } else if (isPhistoCorner) {
      stateClasses = theme.phistoRingCornerBg;
    } else if (isPhistoCenter) {
        stateClasses = theme.phistoRingCenterBg;
    } else if (isHighlighted || isHyperBox) {
      stateClasses = `${theme.cellHighlight}`;
    } else if (isDiagonal) {
        stateClasses = `${theme.cellHighlight} bg-opacity-50`
    } else if (value === 0) {
      stateClasses = theme.cellEmpty;
    } else {
      stateClasses = `${theme.cellBg}`;
    }

    let textClasses = '';
    if (isIncorrect && displayMode !== 'color') {
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
  
  const renderCellContent = (cell: Cell) => {
    if (cell.value !== 0) {
      switch (displayMode) {
        case 'color':
          return <div className={`w-3/5 h-3/5 rounded-full ${COLOR_MAP[cell.value]} ${cell.isOriginal ? '' : 'ring-2 ring-offset-2 ring-offset-transparent ring-white'}`}></div>;
        case 'letter':
          return LETTER_MAP[cell.value];
        case 'japanese':
          return JAPANESE_NUMBER_MAP[cell.value];
        case 'kids':
          const Icon = KIDS_ICON_MAP[cell.value];
          return <Icon className="w-3/4 h-3/4" />;
        default:
          return cell.value;
      }
    }
    
    // Render notes
    return (
        <div 
            className={`grid w-full h-full items-center justify-center leading-none ${theme.noteText} pointer-events-none p-0.5`}
            style={{ gridTemplateColumns: `repeat(${boxRows}, 1fr)`}}
        >
          {Array.from({ length: size }, (_, i) => i + 1).map(n => (
            <div key={n} className="flex items-center justify-center w-full h-full">
              {cell.notes.has(n) && (() => {
                switch (displayMode) {
                  case 'color':
                    return <div className={`w-2/3 h-2/3 rounded-full ${COLOR_MAP[n]}`} />;
                  case 'letter':
                    return <div style={{ fontSize: size === 9 ? '10px' : '8px' }}>{LETTER_MAP[n]}</div>;
                  case 'japanese':
                    return <div style={{ fontSize: size === 9 ? '10px' : '8px' }}>{JAPANESE_NUMBER_MAP[n]}</div>;
                  case 'kids':
                    const Icon = KIDS_ICON_MAP[n];
                    return <Icon className="w-full h-full p-0.5" />;
                  default:
                    return <div style={{ fontSize: size === 9 ? '10px' : '8px' }}>{n}</div>;
                }
              })()}
            </div>
          ))}
        </div>
      )
  };
  
  const PlayerDot: React.FC<{color: PlayerColor}> = ({ color }) => (
      <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${playerColorClasses[color]} ring-1 ring-white/50`}></div>
  );

  return (
    <div className={`w-full mx-auto ${theme.cardBg} rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 border-2 ${theme.borderThick}`} data-sudoku-board>
      <div 
        className="grid bg-transparent"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onMouseDown={(e) => { e.preventDefault(); onCellDragStart(rowIndex, colIndex); }}
              onTouchStart={(e) => { e.preventDefault(); onCellDragStart(rowIndex, colIndex); }}
              disabled={cell.isOriginal && cell.value !== 0}
              className={getCellClass(rowIndex, colIndex, cell)}
              data-row={rowIndex}
              data-col={colIndex}
            >
              {renderCellContent(cell)}
              {duelState && cell.placedBy && <PlayerDot color={cell.placedBy} />}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;