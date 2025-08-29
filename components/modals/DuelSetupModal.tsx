import React from 'react';
import { Shuffle, Swords } from 'lucide-react';
import Modal from '../Modal.tsx';
import { Theme, MultiplayerConfig } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { audioManager } from '../../audio/AudioManager.ts';
import { PLAYER_COLORS } from '../../config.ts';

const playerColorClasses: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    violet: 'bg-violet-500',
};

interface DuelSetupModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    tempDuelConfig: MultiplayerConfig;
    setTempDuelConfig: React.Dispatch<React.SetStateAction<MultiplayerConfig>>;
    startDuel: () => void;
}

const DuelSetupModal: React.FC<DuelSetupModalProps> = ({ show, onClose, theme, tempDuelConfig, setTempDuelConfig, startDuel }) => {
    const { t } = useI18n();

    const handleRandomizePlayers = () => {
        audioManager.playSound('click');
        setTempDuelConfig(c => ({
            ...c,
            players: [...c.players].sort(() => Math.random() - 0.5)
        }));
    };

    return (
        <Modal show={show} onClose={onClose} title={t('duelSetup')} theme={theme}>
            <div className="space-y-4">
                <div>
                    <label className="font-medium block mb-2">{t('players')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {([2, 3, 4] as const).map(count => (
                            <button
                                key={count}
                                onClick={() => {
                                    setTempDuelConfig(c => ({ ...c, playerCount: count, players: PLAYER_COLORS.slice(0, count).map(p => ({ ...p, score: 0 })) }));
                                    audioManager.playSound('click');
                                }}
                                className={`p-3 rounded-lg font-bold transition-colors border-2 ${tempDuelConfig.playerCount === count ? 'bg-blue-600 text-white border-blue-600' : `${theme.button} border-transparent`}`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-medium">{t('playerOrder')}</label>
                        <button onClick={handleRandomizePlayers} className={`flex items-center gap-1 text-sm ${theme.button} py-1 px-2 rounded-md`}>
                            <Shuffle size={14} /> {t('randomize')}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {tempDuelConfig.players.map(player => (
                            <div key={player.id} className={`p-3 rounded-lg ${theme.button} flex items-center space-x-3`}>
                                <div className={`w-6 h-6 rounded-full ${playerColorClasses[player.color]}`}></div>
                                <span className="font-bold">{t(player.nameKey)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="font-medium block mb-2">{t('puzzleSize')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([6, 9] as const).map(size => (
                            <button
                                key={size}
                                onClick={() => { setTempDuelConfig(c => ({ ...c, puzzleSize: size })); audioManager.playSound('click'); }}
                                className={`p-3 rounded-lg font-bold transition-colors border-2 ${tempDuelConfig.puzzleSize === size ? 'bg-blue-600 text-white border-blue-600' : `${theme.button} border-transparent`}`}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label className="font-medium block mb-2">{t('masterTime')}</label>
                        <select
                            value={tempDuelConfig.masterTimer}
                            onChange={e => setTempDuelConfig(c => ({ ...c, masterTimer: Number(e.target.value) }))}
                            className={`w-full p-2 rounded-lg border-2 ${theme.border} ${theme.cardBg}`}
                        >
                            <option value="180">3 {t('minutes')}</option>
                            <option value="300">5 {t('minutes')}</option>
                            <option value="600">10 {t('minutes')}</option>
                            <option value="900">15 {t('minutes')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium block mb-2">{t('turnTime')}</label>
                        <select
                            value={tempDuelConfig.turnTimer}
                            onChange={e => setTempDuelConfig(c => ({ ...c, turnTimer: Number(e.target.value) }))}
                            className={`w-full p-2 rounded-lg border-2 ${theme.border} ${theme.cardBg}`}
                        >
                            <option value="20">20 {t('seconds')}</option>
                            <option value="30">30 {t('seconds')}</option>
                            <option value="45">45 {t('seconds')}</option>
                            <option value="60">60 {t('seconds')}</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => { startDuel(); onClose(); }}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white flex items-center justify-center gap-2`}
                >
                    <Swords /> {t('startDuel')}
                </button>
            </div>
        </Modal>
    );
};

export default DuelSetupModal;
