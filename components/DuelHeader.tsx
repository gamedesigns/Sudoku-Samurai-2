import React from 'react';
import { Theme, DuelState, PlayerColor } from '../types.ts';
import { useI18n } from '../i18n/I18nProvider.tsx';
import { formatTime } from '../utils.ts';

const playerColorClasses: Record<PlayerColor, { bg: string, text: string, border: string }> = {
    red: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    blue: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    green: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
    violet: { bg: 'bg-violet-500', text: 'text-white', border: 'border-violet-500' },
};

interface DuelHeaderProps {
    theme: Theme;
    duelState: DuelState;
}

const DuelHeader: React.FC<DuelHeaderProps> = ({ theme, duelState }) => {
    const { t } = useI18n();

    return (
        <div className="px-2 max-w-md mx-auto w-full mb-2">
            <div className="flex justify-between items-center mb-1">
                <span className='font-bold text-lg'>{t('masterTime')}</span>
                <span className='font-bold text-lg tabular-nums'>{formatTime(duelState.masterTimeLeft)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {duelState.players.map((player, index) => {
                    const colorClass = playerColorClasses[player.color];
                    return (
                        <div key={player.id} className={`p-2 rounded-lg transition-all border-2 ${duelState.currentPlayerIndex === index ? `${colorClass.bg} ${colorClass.text} ${colorClass.border} shadow-lg` : `${theme.cardBg} border-transparent`}`}>
                            <div className='text-xs opacity-80'>{t(player.nameKey)}</div>
                            <div className='font-bold text-lg'>{player.score}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default DuelHeader;
