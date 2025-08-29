import React from 'react';
import Modal from '../Modal.tsx';
import { Theme } from '../../types.ts';
import { useI18n } from '../../i18n/I18nProvider.tsx';

interface AboutModalProps {
    show: boolean;
    onClose: () => void;
    theme: Theme;
}

const AboutModal: React.FC<AboutModalProps> = ({ show, onClose, theme }) => {
    const { t } = useI18n();
    return (
        <Modal show={show} onClose={onClose} title={t('aboutTitle')} theme={theme}>
            <div className="space-y-4 text-sm">
                <p>{t('aboutText1')}</p>
                <p className="text-xs opacity-70">{t('aboutVersion', { version: '1.6.1' })}</p>
            </div>
        </Modal>
    );
};

export default AboutModal;