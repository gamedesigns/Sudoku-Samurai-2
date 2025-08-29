import React from 'react';
import { Sun, Moon, Flame } from 'lucide-react';
import Modal from '../Modal.tsx';
import { Theme, ThemeName, AppSettings } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';
import { lightTheme, warmTheme } from '../../themes.ts';
import { audioManager } from '../../audio/AudioManager.ts';

interface ThemesModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
    themeName: ThemeName;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const ThemesModal: React.FC<ThemesModalProps> = ({ show, onClose, theme, themeName, setSettings }) => {
    const { t } = useI18n();

    const handleThemeChange = (newTheme: ThemeName) => {
        setSettings(s => ({ ...s, theme: newTheme }));
        audioManager.playSound('click');
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title={t('themes')} theme={theme}>
            <div className="space-y-3">
                <button
                    onClick={() => handleThemeChange('light')}
                    className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'light' ? `border-blue-500 ${lightTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
                >
                    <Sun className={`w-5 h-5 ${themeName === 'light' ? 'text-blue-500' : theme.text}`} />
                    <span className={`${themeName === 'light' ? lightTheme.userText : theme.text}`}>{t('lightTheme')}</span>
                </button>
                <button
                    onClick={() => handleThemeChange('warm')}
                    className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'warm' ? `border-red-500 ${warmTheme.cellHighlight}` : `border-transparent ${theme.button}`}`}
                >
                    <Flame className={`w-5 h-5 ${themeName === 'warm' ? 'text-red-500' : theme.text}`} />
                    <span className={`${themeName === 'warm' ? warmTheme.userText : theme.text}`}>{t('warmTheme')}</span>
                </button>
                <button
                    onClick={() => handleThemeChange('dark')}
                    className={`w-full p-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${themeName === 'dark' ? 'border-blue-500 bg-blue-900/20' : `border-transparent ${theme.button}`}`}
                >
                    <Moon className={`w-5 h-5 ${themeName === 'dark' ? 'text-blue-500' : theme.text}`} />
                    <span className={`${themeName === 'dark' ? 'text-blue-300' : theme.text}`}>{t('darkTheme')}</span>
                </button>
            </div>
        </Modal>
    );
};

export default ThemesModal;
