
import React, { useState } from 'react';
import Modal from '../Modal.tsx';
import { Theme, GameConfig, Difficulty } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { audioManager } from '../../audio/AudioManager.ts';
import { GAME_MODES } from '../../config.ts';
import { hasPuzzles } from '../../constants.tsx';

interface NewGameModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    currentGameConfig: GameConfig;
    startNewGame: (config: GameConfig) => void;
}

const NewGameModal: React.FC<NewGameModalProps> = ({ show, onClose, theme, currentGameConfig, startNewGame }) => {
    const { t } = useI18n();
    const [tempGameConfig, setTempGameConfig] = useState<GameConfig>(currentGameConfig);

    const handleStart = () => {
        startNewGame(tempGameConfig);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title={t('newGame')} theme={theme}>
            <div className="space-y-4">
                <div>
                    <label className="font-medium block mb-2">{t('gameMode')}</label>
                    <select
                        value={`${tempGameConfig.mode}-${tempGameConfig.size}`}
                        onChange={(e) => {
                            const parts = e.target.value.split('-');
                            const sizeStr = parts.pop();
                            if (!sizeStr) return; // Should not happen but good practice

                            const mode = parts.join('-') as GameConfig['mode'];
                            const size = Number(sizeStr) as GameConfig['size'];
                            
                            const difficulties = ['Novice', 'Easy', 'Medium', 'Hard'] as const;
                            const firstAvailableDifficulty = difficulties.find(diff => hasPuzzles({ mode, size, difficulty: diff }));
                            setTempGameConfig({ mode, size, difficulty: firstAvailableDifficulty || tempGameConfig.difficulty });
                        }}
                        className={`w-full p-3 rounded-lg border-2 ${theme.border} ${theme.cardBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        {GAME_MODES.map(gm => (
                            <option key={`${gm.mode}-${gm.size}`} value={`${gm.mode}-${gm.size}`}>{t(gm.nameKey)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-medium block mb-2">{t('difficulty')}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['Novice', 'Easy', 'Medium', 'Hard'] as const).map(diff => {
                            const isAvailable = hasPuzzles({ mode: tempGameConfig.mode, size: tempGameConfig.size, difficulty: diff });
                            return (
                                <button
                                    key={diff}
                                    onClick={() => { if (isAvailable) { setTempGameConfig(c => ({ ...c, difficulty: diff })); audioManager.playSound('click'); } }}
                                    disabled={!isAvailable}
                                    className={`p-3 rounded-lg font-bold transition-colors border-2 ${tempGameConfig.difficulty === diff ? 'bg-blue-600 text-white border-blue-600' : isAvailable ? `${theme.button} border-transparent` : `${theme.button} border-transparent opacity-40 cursor-not-allowed`}`}
                                >
                                    {t(diff.toLowerCase())}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <button
                    onClick={handleStart}
                    className={`w-full mt-4 p-4 rounded-xl font-bold transition-colors ${theme.numberButton} text-white`}
                >
                    {t('play')}
                </button>
            </div>
        </Modal>
    );
};

export default NewGameModal;