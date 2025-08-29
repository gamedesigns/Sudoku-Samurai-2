import React from 'react';
import { CellValue, Theme } from '../types';

interface NumberPadProps {
  theme: Theme;
  onNumberClick: (num: CellValue) => void;
  onDeleteClick: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ theme, onNumberClick, onDeleteClick }) => {
  return (
    <div className={`w-full ${theme.cardBg} rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border-2 ${theme.border}`}>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
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
  );
};

export default NumberPad;