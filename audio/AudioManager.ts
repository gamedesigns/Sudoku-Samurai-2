import { SoundEvent } from '../types';
import { AUDIO_CONFIG } from '../config';

class AudioManager {
    private audioContext: AudioContext | null = null;
    private sfxGainNode: GainNode | null = null;
    private musicGainNode: GainNode | null = null;
    private masterGainNode: GainNode | null = null;

    private musicSource: AudioBufferSourceNode | null = null;
    private sfxBuffers: Map<SoundEvent, AudioBuffer> = new Map();
    private musicBuffers: Map<string, AudioBuffer> = new Map();
    
    private currentMusic: string | null = null;
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
        if (!this.audioContext || !url) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn(`Could not load or decode audio file: ${url}`, error);
            return null;
        }
    }
    
    async loadAll() {
        // Load SFX
        for (const key in AUDIO_CONFIG.sfx) {
            const event = key as SoundEvent;
            const buffer = await this.loadSound(AUDIO_CONFIG.sfx[event]);
            if (buffer) this.sfxBuffers.set(event, buffer);
        }
        
        // Load Music
        for (const key in AUDIO_CONFIG.music) {
            const trackName = key as keyof typeof AUDIO_CONFIG.music;
            const buffer = await this.loadSound(AUDIO_CONFIG.music[trackName]);
            if (buffer) this.musicBuffers.set(trackName, buffer);
        }
    }

    playSound(event: SoundEvent) {
        if (!this.audioContext || !this.sfxGainNode) return;
        this.resumeContext();

        const buffer = this.sfxBuffers.get(event);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.sfxGainNode);
            source.start(0);
        } else {
            // Fallback to synth if sound not loaded
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
                gain.gain.setValueAtTime(1, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'delete':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, now);
                gain.gain.setValueAtTime(0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'error':
                 oscillator.type = 'square';
                 oscillator.frequency.setValueAtTime(150, now);
                 gain.gain.setValueAtTime(0.5, now);
                 gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                break;
            case 'click':
                 oscillator.type = 'triangle';
                 oscillator.frequency.setValueAtTime(880, now);
                 gain.gain.setValueAtTime(0.5, now);
                 gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
                break;
        }
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
    
    playMusic(trackName: keyof typeof AUDIO_CONFIG.music) {
        if (!this.audioContext || !this.musicGainNode || this.currentMusic === trackName) return;
        this.resumeContext();
        this.stopMusic();

        const buffer = this.musicBuffers.get(trackName);
        if (buffer) {
            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = buffer;
            this.musicSource.loop = true;
            this.musicSource.connect(this.musicGainNode);
            this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 1); // Fade in
            this.musicSource.start(0);
            this.currentMusic = trackName;
        }
    }

    playVictoryMusic() {
        this.playMusic('victory');
    }

    stopMusic(fadeOutDuration = 1) {
        if (!this.audioContext || !this.musicSource || !this.musicGainNode) return;
        
        const now = this.audioContext.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
        
        const oldSource = this.musicSource;
        oldSource.stop(now + fadeOutDuration);

        this.musicSource = null;
        this.currentMusic = null;
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