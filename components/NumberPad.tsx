

import React from 'react';
import { CellValue, GameConfig, Theme, DisplayMode } from '../types.ts';
import { COLOR_MAP, LETTER_MAP, JAPANESE_NUMBER_MAP, KIDS_ICON_MAP } from '../constants.tsx';

interface NumberPadProps {
  theme: Theme;
  gameConfig: GameConfig;
  displayMode: DisplayMode;
  onNumberClick: (num: CellValue) => void;
  onDeleteClick: () => void;
  onKeypadDragStart: (num: CellValue) => void;
  disabled: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ theme, gameConfig, displayMode, onNumberClick, onDeleteClick, onKeypadDragStart, disabled }) => {
  const { size } = gameConfig;
  const gridCols = size === 9 ? 'grid-cols-5' : size === 6 ? 'grid-cols-4' : 'grid-cols-3';

  const renderButtonContent = (number: number) => {
    switch (displayMode) {
        case 'color':
            return <div className={`w-3/5 h-3/5 rounded-full ${COLOR_MAP[number]}`} />;
        case 'letter':
            return LETTER_MAP[number];
        case 'japanese':
            return JAPANESE_NUMBER_MAP[number];
        case 'kids':
            const Icon = KIDS_ICON_MAP[number];
            return <Icon className="w-3/4 h-3/4" />;
        default:
            return number;
    }
  };

  return (
    <div className='w-full'>
      <div className={`${theme.cardBg} rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border-2 ${theme.border}`}>
        <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
          {Array.from({ length: size }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              disabled={disabled}
              onClick={() => onNumberClick(number as CellValue)}
              onMouseDown={(e) => { e.preventDefault(); onKeypadDragStart(number as CellValue); }}
              onTouchStart={(e) => { onKeypadDragStart(number as CellValue); }}
              className={`aspect-square rounded-lg sm:rounded-xl font-bold text-xl sm:text-2xl transition-all duration-200 flex items-center justify-center
                ${theme.button} ${theme.text} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
                {renderButtonContent(number)}
            </button>
          ))}
          <button
            onClick={onDeleteClick}
            disabled={disabled}
            className={`aspect-square rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;