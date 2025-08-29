import React from 'react';
import { Award } from 'lucide-react';
import Modal from '../Modal.tsx';
import { Theme, GameConfig } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { audioManager } from '../../audio/AudioManager.ts';
import { formatTime } from '../../utils.ts';

interface WinModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    time: number;
    gameConfig: GameConfig;
    startNewGame: (config: GameConfig) => void;
}

const WinModal: React.FC<WinModalProps> = ({ show, onClose, theme, time, gameConfig, startNewGame }) => {
    const { t } = useI18n();

    const handlePlayAgain = () => {
        startNewGame(gameConfig);
        audioManager.playSound('click');
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title={t('winTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                <p className="text-lg">{t('winText')}</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <button
                    onClick={handlePlayAgain}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white`}
                >
                    {t('winPlayAgain')}
                </button>
            </div>
        </Modal>
    );
};

export default WinModal;
