import React from 'react';
import { Award } from 'lucide-react';
import Modal from '../Modal.tsx';
import { Theme, DuelState, MultiplayerConfig, PlayerColor } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { audioManager } from '../../audio/AudioManager.ts';

const playerColorClasses: Record<PlayerColor, { bg: string }> = {
    red: { bg: 'bg-red-500' },
    blue: { bg: 'bg-blue-500' },
    green: { bg: 'bg-green-500' },
    violet: { bg: 'bg-violet-500' },
};

interface DuelResultsModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    duelState: DuelState | null;
    lastDuelConfig: MultiplayerConfig | null;
    startDuel: (config: MultiplayerConfig) => void;
    openDuelSetup: () => void;
}

const DuelResultsModal: React.FC<DuelResultsModalProps> = ({ show, onClose, theme, duelState, lastDuelConfig, startDuel, openDuelSetup }) => {
    const { t } = useI18n();

    const handlePlayAgain = () => {
        if (lastDuelConfig) {
            startDuel(lastDuelConfig);
        } else {
            openDuelSetup();
        }
        audioManager.playSound('click');
        onClose();
    };
    
    const sortedPlayers = duelState?.players.sort((a,b) => b.score - a.score) || [];

    return (
        <Modal show={show} onClose={onClose} title={t('duelResultsTitle')} theme={theme}>
            <div className="space-y-4 text-center">
                <Award className="w-16 h-16 mx-auto text-amber-500" strokeWidth={1.5} />
                {duelState?.winner ? (
                    <p className='text-lg'>{t('duelWinner', { player: t(duelState.winner.nameKey) })}</p>
                ) : (
                    <p className='text-lg'>{t('duelTimeUp')}</p>
                )}
                <div className='space-y-2 pt-4'>
                    {sortedPlayers.map(p => (
                        <div key={p.id} className={`flex justify-between items-center p-2 rounded-lg ${theme.button}`}>
                            <div className='flex items-center space-x-2'>
                                <div className={`w-5 h-5 rounded-full ${playerColorClasses[p.color].bg}`}></div>
                                <span className='font-bold'>{t(p.nameKey)}</span>
                            </div>
                            <span className='font-bold text-lg'>{p.score}</span>
                        </div>
                    ))}
                </div>
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

export default DuelResultsModal;
