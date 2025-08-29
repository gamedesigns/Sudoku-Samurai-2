import { SoundEvent, MusicProfile, Difficulty } from '../types.ts';
import { AUDIO_CONFIG } from '../config.ts';

class AudioManager {
    private audioContext: AudioContext | null = null;
    private sfxGainNode: GainNode | null = null;
    private musicGainNode: GainNode | null = null;
    private masterGainNode: GainNode | null = null;

    private musicSource: AudioBufferSourceNode | null = null;
    private sfxBuffers: Map<SoundEvent, AudioBuffer[]> = new Map();
    private musicBuffers: Map<string, AudioBuffer> = new Map(); // Key is the file path
    
    private currentPlaylist: string[] = [];
    private shuffledQueue: string[] = [];
    private currentTrackIndex: number = -1;
    
    public isInitialized: boolean = false;

    initialize() {
        if (this.isInitialized || typeof window.AudioContext === 'undefined') return;

        try {
            this.audioContext = new AudioContext();
            
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);

            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.connect(this.masterGainNode);

            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.connect(this.masterGainNode);

            this.isInitialized = true;
            console.log('Audio manager initialized.');
        } catch (e) {
            console.error('Error initializing AudioContext:', e);
        }
    }

    private async loadSound(url: string): Promise<AudioBuffer | null> {
        if (!this.audioContext || !url || this.musicBuffers.has(url)) return this.musicBuffers.get(url) || null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.musicBuffers.set(url, buffer); // Cache all loaded buffers
            return buffer;
        } catch (error) {
            console.warn(`Could not load or decode audio file: ${url}`, error);
            return null;
        }
    }
    
    async loadAll() {
        const allAudioFiles = new Set<string>();

        // Gather all SFX files
        for (const key in AUDIO_CONFIG.sfx) {
            AUDIO_CONFIG.sfx[key as SoundEvent].forEach(file => allAudioFiles.add(file));
        }

        // Gather all music files
        allAudioFiles.add(AUDIO_CONFIG.music.victory);
        Object.values(AUDIO_CONFIG.music.profiles.Calm).forEach(file => allAudioFiles.add(file));
        Object.values(AUDIO_CONFIG.music.profiles.Powerful).forEach(file => allAudioFiles.add(file));
        Object.values(AUDIO_CONFIG.music.profiles.Level).forEach(playlist => playlist.forEach(file => allAudioFiles.add(file)));

        // Load all unique files
        await Promise.all(Array.from(allAudioFiles).map(file => this.loadSound(file)));

        // Populate SFX map
        for (const key in AUDIO_CONFIG.sfx) {
            const event = key as SoundEvent;
            const buffers = AUDIO_CONFIG.sfx[event]
                .map(file => this.musicBuffers.get(file))
                .filter((b): b is AudioBuffer => !!b);
            this.sfxBuffers.set(event, buffers);
        }
    }

    playSound(event: SoundEvent) {
        if (!this.audioContext || !this.sfxGainNode) return;
        this.resumeContext();

        const buffers = this.sfxBuffers.get(event);
        if (buffers && buffers.length > 0) {
            const buffer = buffers[Math.floor(Math.random() * buffers.length)]; // Play a random variant
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.sfxGainNode);
            source.start(0);
        } else {
            this.playSynth(event);
        }
    }
    
    private playSynth(event: SoundEvent) {
        if (!this.audioContext || !this.sfxGainNode) return;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        oscillator.connect(gain);
        gain.connect(this.sfxGainNode);
        
        const now = this.audioContext.currentTime;

        switch(event) {
            case 'placeNumber':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(0.2, now); // Reduced volume
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'delete':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, now);
                gain.gain.setValueAtTime(0.15, now); // Reduced volume
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'error':
                 oscillator.type = 'square';
                 oscillator.frequency.setValueAtTime(150, now);
                 gain.gain.setValueAtTime(0.3, now); // Reduced volume
                 gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                break;
            case 'click':
                 oscillator.type = 'triangle';
                 oscillator.frequency.setValueAtTime(880, now);
                 gain.gain.setValueAtTime(0.25, now); // Reduced volume
                 gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                break;
        }
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
    
    private setPlaylist(profile: MusicProfile, difficulty: Difficulty) {
        const { profiles } = AUDIO_CONFIG.music;
        let newPlaylist: string[] = [];

        switch(profile) {
            case 'Calm':
                newPlaylist = profiles.Calm;
                break;
            case 'Powerful':
                newPlaylist = profiles.Powerful;
                break;
            case 'Level':
                newPlaylist = profiles.Level[difficulty];
                break;
            case 'Mixed':
                newPlaylist = [...profiles.Calm, ...profiles.Powerful, ...profiles.Level[difficulty]];
                break;
        }
        
        // Fisher-Yates shuffle
        const shuffle = (array: string[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        this.currentPlaylist = newPlaylist;
        this.shuffledQueue = shuffle([...this.currentPlaylist]);
        this.currentTrackIndex = -1;
    }

    private playNextTrack() {
        if (this.currentPlaylist.length === 0) return;
        this.currentTrackIndex++;
        if (this.currentTrackIndex >= this.shuffledQueue.length) {
            // Reshuffle and start over
            this.shuffledQueue = this.shuffledQueue.sort(() => Math.random() - 0.5);
            this.currentTrackIndex = 0;
        }

        const trackPath = this.shuffledQueue[this.currentTrackIndex];
        const buffer = this.musicBuffers.get(trackPath);

        if (buffer && this.audioContext && this.musicGainNode) {
            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = buffer;
            this.musicSource.connect(this.musicGainNode);
            
            // When track ends, play the next one
            this.musicSource.onended = () => {
                this.playNextTrack();
            };
            
            this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 1.5); // Fade in
            this.musicSource.start(0);
        }
    }

    playBackgroundMusic(profile: MusicProfile, difficulty: Difficulty) {
        if (!this.audioContext) return;
        this.resumeContext();
        this.stopMusic(0.5);
        this.setPlaylist(profile, difficulty);
        this.playNextTrack();
    }
    
    playVictoryMusic() {
        if (!this.audioContext || !this.musicGainNode) return;
        this.resumeContext();
        this.stopMusic();

        const buffer = this.musicBuffers.get(AUDIO_CONFIG.music.victory);
        if (buffer) {
            const victorySource = this.audioContext.createBufferSource();
            victorySource.buffer = buffer;
            victorySource.connect(this.musicGainNode);
            this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 1); // Fade in
            victorySource.start(0);
        }
    }

    stopMusic(fadeOutDuration = 1) {
        if (!this.audioContext || !this.musicSource || !this.musicGainNode) return;
        
        this.musicSource.onended = null; // IMPORTANT: prevent next track from starting
        
        const now = this.audioContext.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
        
        this.musicSource.stop(now + fadeOutDuration);
        this.musicSource = null;
        this.currentPlaylist = [];
        this.shuffledQueue = [];
        this.currentTrackIndex = -1;
    }
    
    private resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    setSfxVolume(volume: number) {
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = volume;
        }
    }
    
    setMusicVolume(volume: number) {
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = volume;
        }
    }

    setMuted(isMuted: boolean) {
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = isMuted ? 0 : 1;
        }
    }
}

// Export a singleton instance
export const audioManager = new AudioManager();