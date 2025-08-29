
import React, { useCallback, useEffect, useState } from 'react';
import { Play, Settings, Palette, RefreshCw, Info, Lightbulb, Brush, Swords } from 'lucide-react';
import { lightTheme, darkTheme, warmTheme } from './themes.ts';
import { AppSettings, DisplayMode, GameConfig, Player } from './types.ts';
import { formatTime } from './utils.ts';

// Components
import Header from './components/Header.tsx';
import SudokuBoard from './components/SudokuBoard.tsx';
import NumberPad from './components/NumberPad.tsx';
import HintTutor from './components/HintTutor.tsx';
import DragGhost from './components/DragGhost.tsx';
import GameControls from './components/GameControls.tsx';
import DuelHeader from './components/DuelHeader.tsx';
import AboutModal from './components/modals/AboutModal.tsx';
import ThemesModal from './components/modals/ThemesModal.tsx';
import SettingsModal from './components/modals/SettingsModal.tsx';
import NewGameModal from './components/modals/NewGameModal.tsx';
import DuelSetupModal from './components/modals/DuelSetupModal.tsx';
import WinModal from './components/modals/WinModal.tsx';
import TurnReadyModal from './components/modals/TurnReadyModal.tsx';
import DuelResultsModal from './components/modals/DuelResultsModal.tsx';


// Hooks
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { useGameState } from './hooks/useGameState.ts';
import { useDuelState } from './hooks/useDuelState.ts';
import { useDragAndDrop } from './hooks/useDragAndDrop.ts';
import { useModals } from './hooks/useModals.ts';

// Other
import { I18nProvider, useI18n } from './i18n/I18nProvider.tsx';
import { DEFAULT_SETTINGS } from './config.ts';
import { audioManager } from './audio/AudioManager.ts';

const playerHexColors: Record<string, string> = {
    red: 'ef4444',
    blue: '3b82f6',
    green: '22c55e',
    violet: '8b5cf6',
};

const Game: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<AppSettings>('sudokuSettings', DEFAULT_SETTINGS);
    const { t, setLang, lang } = useI18n();
    const themes = { light: lightTheme, warm: warmTheme, dark: darkTheme };
    const theme = themes[settings.theme];
    
    // --- All Modal States and Handlers ---
    const modals = useModals();

    const gameEndCallbacks = {
        showWinModal: () => modals.setWinModalOpen(true),
        endDuelCallback: (players: Player[]) => {
            if (duel.duelState) {
                duel.setDuelState(d => d ? { ...d, winner: [...players].sort((a, b) => b.score - a.score)[0], isPaused: true } : null);
                modals.setDuelResultsOpen(true);
                setGameState('completed');
                audioManager.playVictoryMusic();
            }
        },
    };

    // --- All Game Logic and State ---
    const {
        grid, setGrid, solvedGrid, selectedCell, gameState, setGameState, time, inputMode, setInputMode, incorrectCells, hint, setHint,
        startNewGame, handleCellClick, checkMistakes, placeNumber, revealHint, handleHintClick, resetGameState
    } = useGameState(settings, setSettings, gameEndCallbacks.showWinModal, gameEndCallbacks.endDuelCallback);

    // --- Duel Mode Logic and State ---
    const duel = useDuelState(setGameState, resetGameState, 
        () => modals.openModal(modals.setTurnReadyModalOpen), 
        () => modals.openModal(modals.setDuelResultsOpen)
    );

    // --- Drag and Drop Logic and State ---
    const { isDragging, draggingNumber, dragPosition, dragTargetCell, dragOriginCell, handleKeypadDragStart, handleCellDragStart } = useDragAndDrop(
        grid, setGrid, settings, 
        (r, c, num, g) => placeNumber(r, c, num, g, duel.duelState, duel.setDuelState), // Pass duel state to placeNumber
        checkMistakes, inputMode, selectedCell, duel.duelState, duel.setDuelState
    );
    
    // --- Effect for Initializing and Syncing ---
    useEffect(() => {
        if (lang !== settings.language) setLang(settings.language);
        audioManager.initialize();
        audioManager.loadAll();
    }, [settings.language, lang, setLang]);

    useEffect(() => {
        audioManager.setMusicVolume(settings.musicVolume);
        audioManager.setSfxVolume(settings.sfxVolume);
        audioManager.setMuted(settings.isMuted);
    }, [settings.musicVolume, settings.sfxVolume, settings.isMuted]);


    // --- Helper Functions and Derived State ---
    const handleResetSettings = () => {
        audioManager.playSound('click');
        setSettings(DEFAULT_SETTINGS);
        startNewGame(DEFAULT_SETTINGS.gameConfig);
        modals.closeAllModals();
    };

    const handleDisplayModeChange = () => {
        audioManager.playSound('click');
        const modes: DisplayMode[] = ['number', 'color', 'letter', 'japanese', 'kids'];
        const nextIndex = (modes.indexOf(settings.displayMode) + 1) % modes.length;
        setSettings(s => ({ ...s, displayMode: modes[nextIndex] }));
    };

    const currentDuelPlayer = duel.duelState ? duel.duelState.players[duel.duelState.currentPlayerIndex] : null;
    // FIX: Explicitly type currentConfig as GameConfig to resolve type inference issues.
    const currentConfig: GameConfig = gameState === 'duel' && duel.duelConfig ? { size: duel.duelConfig.puzzleSize, mode: 'Duel', difficulty: duel.duelConfig.difficulty } : settings.gameConfig;
    
    // Loading screen
    if (!grid) {
        return <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text} flex items-center justify-center`}>Loading...</div>;
    }

    return (
        <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
            {isDragging && draggingNumber && <DragGhost number={draggingNumber} position={dragPosition} displayMode={settings.displayMode} theme={theme} gameConfig={currentConfig} />}
            
            <div className="relative max-w-5xl mx-auto flex flex-col min-h-screen">
                <Header theme={theme} isMenuOpen={modals.isMenuOpen} onMenuToggle={() => { modals.setMenuOpen(!modals.isMenuOpen); audioManager.playSound('click'); }} isMuted={settings.isMuted} onMuteToggle={() => { setSettings(s => ({ ...s, isMuted: !s.isMuted })); audioManager.playSound('click'); }} />

                {modals.isMenuOpen && (
                    <div className={`absolute top-20 right-4 ${theme.cardBg} rounded-2xl shadow-xl z-50 border-2 ${theme.border} overflow-hidden w-48`}>
                        <button onClick={() => { modals.openModal(modals.setNewGameOpen); modals.setMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}><Play className="w-5 h-5" /><span>{t('newGame')}</span></button>
                        <button onClick={() => { modals.openModal(modals.setSettingsOpen); modals.setMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}><Settings className="w-5 h-5" /><span>{t('settings')}</span></button>
                        <button onClick={() => { modals.openModal(modals.setThemesOpen); modals.setMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}><Palette className="w-5 h-5" /><span>{t('themes')}</span></button>
                        <button onClick={handleResetSettings} className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}><RefreshCw className="w-5 h-5" /><span>{t('resetSettings')}</span></button>
                        <button onClick={() => { modals.openModal(modals.setAboutOpen); modals.setMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${theme.button}`}><Info className="w-5 h-5" /><span>{t('about')}</span></button>
                    </div>
                )}

                <main className="flex-grow flex flex-col justify-center p-2 sm:p-4">
                    {gameState !== 'duel' ? (
                        <div className="flex justify-between items-center px-2 max-w-md mx-auto w-full">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleDisplayModeChange} className={`p-1.5 rounded-md ${theme.button}`} title={t('displayModeTooltip')}><Brush className="w-4 h-4" /></button>
                                <div className="text-sm font-medium">{t(settings.gameConfig.mode)} • {t(settings.gameConfig.difficulty.toLowerCase())}</div>
                            </div>
                            <div className="text-lg font-semibold tabular-nums">{formatTime(time)}</div>
                        </div>
                    ) : duel.duelState && <DuelHeader theme={theme} duelState={duel.duelState} />}
                    
                    <div className="game-layout flex flex-col items-center flex-grow justify-center">
                        <div className="board-wrapper w-full max-w-md">
                            <SudokuBoard grid={grid} gameConfig={currentConfig} displayMode={settings.displayMode} selectedCell={selectedCell} dragTargetCell={dragTargetCell} dragOriginCell={dragOriginCell} theme={theme} highlightMode={settings.highlightMode} onCellClick={(r, c) => handleCellClick(r, c)} onCellDragStart={handleCellDragStart} incorrectCells={incorrectCells} hint={hint} phistomefelRing={settings.phistomefelRing} duelState={duel.duelState} />
                        </div>
                        <div className="controls-wrapper mt-4 w-full max-w-md flex flex-col items-center space-y-4">
                             <GameControls theme={theme} inputMode={inputMode} setInputMode={setInputMode} gameState={gameState} openDuelSetup={() => modals.openModal(modals.setDuelSetupOpen)} />
                            <div className="flex items-stretch w-full space-x-2 sm:space-x-3">
                                <NumberPad theme={theme} gameConfig={currentConfig} displayMode={settings.displayMode} onNumberClick={(num) => placeNumber(selectedCell![0], selectedCell![1], num, grid, duel.duelState, duel.setDuelState)} onDeleteClick={() => placeNumber(selectedCell![0], selectedCell![1], 0, grid, duel.duelState, duel.setDuelState)} onKeypadDragStart={handleKeypadDragStart} />
                                <div className="relative h-auto aspect-square">
                                    {gameState === 'duel' && duel.duelState && !duel.duelState.isPaused && currentDuelPlayer && (
                                        <div className="absolute inset-0 transition-all" style={{ transform: 'rotate(-90deg)' }}>
                                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={theme.progressBg} strokeWidth="3" />
                                                <path className="transition-all duration-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={`#${playerHexColors[currentDuelPlayer.color]}`} strokeWidth="3" strokeDasharray={`${(duel.duelState.turnTimeLeft / duel.duelConfig!.turnTimer) * 100}, 100`} />
                                            </svg>
                                        </div>
                                    )}
                                    <button onClick={() => handleHintClick(currentConfig)} disabled={gameState === 'new' || gameState === 'completed'} className={`w-full h-full rounded-lg sm:rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${theme.button} ${theme.text} hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`}><Lightbulb className="w-6 h-6 sm:w-7 sm:h-7" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {hint && hint.stage === 'tutor' && <HintTutor hint={hint} theme={theme} onClose={() => { setHint(null); audioManager.playSound('click'); }} onReveal={revealHint} />}

                <SettingsModal show={modals.isSettingsOpen} onClose={() => modals.closeModal(modals.setSettingsOpen)} theme={theme} settings={settings} setSettings={setSettings} />
                <ThemesModal show={modals.isThemesOpen} onClose={() => modals.closeModal(modals.setThemesOpen)} theme={theme} themeName={settings.theme} setSettings={setSettings} />
                <AboutModal show={modals.isAboutOpen} onClose={() => modals.closeModal(modals.setAboutOpen)} theme={theme} />
                <NewGameModal show={modals.isNewGameOpen} onClose={() => modals.closeModal(modals.setNewGameOpen)} theme={theme} currentGameConfig={settings.gameConfig} startNewGame={startNewGame} />
                <WinModal show={modals.isWinModalOpen} onClose={() => modals.closeModal(modals.setWinModalOpen)} theme={theme} time={time} gameConfig={settings.gameConfig} startNewGame={startNewGame} />
                <DuelSetupModal show={modals.isDuelSetupOpen} onClose={() => modals.closeModal(modals.setDuelSetupOpen)} theme={theme} tempDuelConfig={duel.tempDuelConfig} setTempDuelConfig={duel.setTempDuelConfig} startDuel={() => duel.startDuel(duel.tempDuelConfig, settings.musicProfile, settings.gameConfig.difficulty)} />
                <TurnReadyModal show={modals.isTurnReadyModalOpen} onClose={() => modals.closeModal(modals.setTurnReadyModalOpen)} theme={theme} currentPlayer={currentDuelPlayer} onStartTurn={duel.startPlayerTurn} />
                <DuelResultsModal show={modals.isDuelResultsOpen} onClose={() => modals.closeModal(modals.setDuelResultsOpen)} theme={theme} duelState={duel.duelState} lastDuelConfig={duel.lastDuelConfig.current} startDuel={(config) => duel.startDuel(config, settings.musicProfile, settings.gameConfig.difficulty)} openDuelSetup={() => modals.openModal(modals.setDuelSetupOpen)} />
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <I18nProvider>
        <Game />
    </I18nProvider>
);

export default App;
