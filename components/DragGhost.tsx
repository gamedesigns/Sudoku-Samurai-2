
import React from 'react';
import { CellValue, DisplayMode, GameConfig, Theme } from '../types.ts';
import { COLOR_MAP, JAPANESE_NUMBER_MAP, LETTER_MAP, KIDS_ICON_MAP } from '../constants.tsx';

interface DragGhostProps {
  number: CellValue;
  position: { x: number; y: number };
  displayMode: DisplayMode;
  theme: Theme;
  gameConfig: GameConfig;
}

const DragGhost: React.FC<DragGhostProps> = ({ number, position, displayMode, theme, gameConfig }) => {
  const { size } = gameConfig;

  const renderContent = () => {
    switch (displayMode) {
      case 'color':
        return <div className={`w-full h-full rounded-full ${COLOR_MAP[number]}`} />;
      case 'letter':
        return LETTER_MAP[number];
      case 'japanese':
        return JAPANESE_NUMBER_MAP[number];
      case 'kids':
        const Icon = KIDS_ICON_MAP[number];
        return <Icon className="w-full h-full" />;
      default:
        return number;
    }
  };
  
  const sizeClasses = size === 9 ? 'w-12 h-12 text-2xl' : size === 6 ? 'w-10 h-10 text-xl' : 'w-8 h-8 text-lg';

  return (
    <div
      className={`fixed top-0 left-0 ${theme.cardBg} ${theme.text} rounded-full font-bold
        flex items-center justify-center pointer-events-none shadow-lg z-50
        transition-transform duration-75 ease-out`}
      style={{
        transform: `translate(${position.x - 24}px, ${position.y - 24}px) scale(1.1)`,
        width: '48px',
        height: '48px'
      }}
    >
        <div className={`flex items-center justify-center ${sizeClasses}`}>
         {renderContent()}
        </div>
    </div>
  );
};

export default DragGhost;
