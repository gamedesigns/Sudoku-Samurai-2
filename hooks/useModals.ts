import { useState } from 'react';
import { audioManager } from '../audio/AudioManager.ts';

export const useModals = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isAboutOpen, setAboutOpen] = useState(false);
    const [isThemesOpen, setThemesOpen] = useState(false);
    const [isNewGameOpen, setNewGameOpen] = useState(false);
    const [isWinModalOpen, setWinModalOpen] = useState(false);
    const [isDuelSetupOpen, setDuelSetupOpen] = useState(false);
    const [isTurnReadyModalOpen, setTurnReadyModalOpen] = useState(false);
    const [isDuelResultsOpen, setDuelResultsOpen] = useState(false);

    const closeModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false);
        audioManager.playSound('click');
    };

    const openModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(true);
        audioManager.playSound('click');
    }

    const closeAllModals = () => {
        setSettingsOpen(false);
        setAboutOpen(false);
        setThemesOpen(false);
        setMenuOpen(false);
        setNewGameOpen(false);
        setDuelSetupOpen(false);
        setDuelResultsOpen(false);
    };

    return {
        isMenuOpen, setMenuOpen,
        isSettingsOpen, setSettingsOpen,
        isAboutOpen, setAboutOpen,
        isThemesOpen, setThemesOpen,
        isNewGameOpen, setNewGameOpen,
        isWinModalOpen, setWinModalOpen,
        isDuelSetupOpen, setDuelSetupOpen,
        isTurnReadyModalOpen, setTurnReadyModalOpen,
        isDuelResultsOpen, setDuelResultsOpen,
        closeModal,
        openModal,
        closeAllModals
    };
};
