import React from 'react';
import Modal from '../Modal.tsx';
import { Theme, AppSettings, MusicProfile, Language } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { audioManager } from '../../audio/AudioManager.ts';
import { MUSIC_PROFILES, LANGUAGES } from '../../config.ts';
import { lightTheme } from '../../themes.ts';

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Toggle: React.FC<{ label: string; isEnabled: boolean; onToggle: () => void; theme: Theme }> = ({ label, isEnabled, onToggle, theme }) => (
    <div className="flex justify-between items-center">
        <span className="font-medium">{label}</span>
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors ${isEnabled ? theme.toggleBgActive : theme.toggleBg} relative`}
        >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose, theme, settings, setSettings }) => {
    const { t } = useI18n();
    const { highlightMode, mistakeChecker, swooshInput, phistomefelRing, startFullscreen, musicProfile, musicVolume, sfxVolume, language } = settings;
    
    const handleToggle = (key: keyof AppSettings) => {
        setSettings(s => ({ ...s, [key]: !s[key] }));
        audioManager.playSound('click');
    };

    return (
        <Modal show={show} onClose={onClose} title={t('settings')} theme={theme}>
            <div className="space-y-6">
                <Toggle label={t('highlightMode')} isEnabled={highlightMode} onToggle={() => handleToggle('highlightMode')} theme={theme} />
                <Toggle label={t('mistakeChecker')} isEnabled={mistakeChecker} onToggle={() => handleToggle('mistakeChecker')} theme={theme} />
                <Toggle label={t('swooshInput')} isEnabled={swooshInput} onToggle={() => handleToggle('swooshInput')} theme={theme} />
                <Toggle label={t('phistomefelRing')} isEnabled={phistomefelRing} onToggle={() => handleToggle('phistomefelRing')} theme={theme} />
                <Toggle label={t('startFullscreen')} isEnabled={startFullscreen} onToggle={() => handleToggle('startFullscreen')} theme={theme} />

                <div>
                    <span className="font-medium block mb-2">{t('musicProfile')}</span>
                    <select
                        value={musicProfile}
                        onChange={(e) => {
                            const newProfile = e.target.value as MusicProfile;
                            setSettings(s => ({ ...s, musicProfile: newProfile }));
                            audioManager.playBackgroundMusic(newProfile, settings.gameConfig.difficulty);
                            audioManager.playSound('click');
                        }}
                        className={`w-full p-3 rounded-lg border-2 ${theme.border} ${theme.cardBg} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        {MUSIC_PROFILES.map(profile => (
                            <option key={profile} value={profile}>{t(`musicProfile_${profile.toLowerCase()}`)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <span className="font-medium block mb-2">{t('musicVolume')}</span>
                    <input
                        type="range" min="0" max="1" step="0.05"
                        value={musicVolume}
                        onChange={(e) => setSettings(s => ({ ...s, musicVolume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                <div>
                    <span className="font-medium block mb-2">{t('sfxVolume')}</span>
                    <input
                        type="range" min="0" max="1" step="0.05"
                        value={sfxVolume}
                        onChange={(e) => setSettings(s => ({ ...s, sfxVolume: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                <div>
                    <span className="font-medium block mb-2">{t('language')}</span>
                    <div className="flex space-x-2">
                        {LANGUAGES.map(({ code, name }) => (
                            <button key={code} onClick={() => { setSettings(s => ({ ...s, language: code })); audioManager.playSound('click'); }} className={`w-full p-2 text-sm rounded-lg font-semibold border-2 transition-colors ${language === code ? `border-blue-500 ${lightTheme.cellHighlight} ${lightTheme.userText}` : `border-transparent ${theme.button}`}`}>
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
