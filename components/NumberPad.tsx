import React from 'react';
import { CellValue, GameConfig, Theme } from '../types';

interface NumberPadProps {
  theme: Theme;
  gameConfig: GameConfig;
  onNumberClick: (num: CellValue) => void;
  onDeleteClick: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ theme, gameConfig, onNumberClick, onDeleteClick }) => {
  const { size } = gameConfig;
  const gridCols = size === 9 ? 'grid-cols-5' : size === 6 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className='w-full'>
      <div className={`${theme.cardBg} rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border-2 ${theme.border}`}>
        <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
          {Array.from({ length: size }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => onNumberClick(number as CellValue)}
              className={`aspect-square rounded-lg sm:rounded-xl font-bold text-xl sm:text-2xl transition-all duration-200 flex items-center justify-center
                ${theme.button} ${theme.text} hover:scale-105 active:scale-95`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={onDeleteClick}
            className={`aspect-square rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} hover:scale-105 active:scale-95`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPad;