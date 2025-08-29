import React from 'react';
import { Swords } from 'lucide-react';
import { Theme } from '../types.ts';
import { useI18n } from '../i18n/I18nProvider.tsx';
import { audioManager } from '../audio/AudioManager.ts';

interface GameControlsProps {
    theme: Theme;
    inputMode: 'normal' | 'notes';
    setInputMode: (mode: 'normal' | 'notes') => void;
    gameState: string;
    openDuelSetup: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ theme, inputMode, setInputMode, gameState, openDuelSetup }) => {
    const { t } = useI18n();

    return (
        <div className={`flex items-center justify-center p-1 rounded-full ${theme.cardBg} border-2 ${theme.border} shadow-inner w-full`}>
            <button
                onClick={() => { setInputMode('normal'); audioManager.playSound('click'); }}
                className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all ${inputMode === 'normal' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}
            >
                {t('number')}
            </button>
            <button
                onClick={() => { setInputMode('notes'); audioManager.playSound('click'); }}
                className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all ${inputMode === 'notes' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}
            >
                {t('notes')}
            </button>
            <button
                onClick={openDuelSetup}
                className={`px-4 py-2 w-full text-sm font-bold rounded-full transition-all flex items-center justify-center gap-1 ${gameState === 'duel' ? `${theme.numberButton} text-white shadow` : `${theme.text} opacity-70`}`}
            >
                <Swords size={16} /> {t('duel')}
            </button>
        </div>
    );
};

export default GameControls;
