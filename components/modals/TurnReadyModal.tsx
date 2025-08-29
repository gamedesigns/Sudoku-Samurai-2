import React from 'react';
import Modal from '../Modal.tsx';
import { Theme, PlayerColor, Player } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';

const playerColorClasses: Record<PlayerColor, { bg: string, text: string }> = {
    red: { bg: 'bg-red-500', text: 'text-white' },
    blue: { bg: 'bg-blue-500', text: 'text-white' },
    green: { bg: 'bg-green-500', text: 'text-white' },
    violet: { bg: 'bg-violet-500', text: 'text-white' },
};

interface TurnReadyModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    currentPlayer: Player | null;
    onStartTurn: () => void;
}

const TurnReadyModal: React.FC<TurnReadyModalProps> = ({ show, onClose, theme, currentPlayer, onStartTurn }) => {
    const { t } = useI18n();
    
    const handleStart = () => {
        onStartTurn();
        onClose();
    }

    if (!currentPlayer) return null;
    
    const colorClass = playerColorClasses[currentPlayer.color];

    return (
        <Modal show={show} onClose={() => {}} title={t('turnReadyTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto ${colorClass.bg}`}></div>
                <p className="text-xl font-bold">{t('getReady', { player: t(currentPlayer.nameKey) })}</p>
                <button
                    onClick={handleStart}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${colorClass.bg} ${colorClass.text}`}
                >
                    {t('startTurn')}
                </button>
            </div>
        </Modal>
    );
};

export default TurnReadyModal;
