class SoundManager {
  private ctx: AudioContext | null = null;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.5);
  }

  public playGameOver() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.5);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.5);
  }

  public playPop() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.1);
  }

  public playStartGame() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.2);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.3);
  }

  public startMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;
    
    this.musicOsc = this.ctx.createOscillator();
    this.musicGain = this.ctx.createGain();
    
    this.musicOsc.type = 'triangle';
    this.musicOsc.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
    
    this.musicGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    
    this.musicOsc.connect(this.musicGain);
    this.musicGain.connect(this.ctx.destination);
    
    this.musicOsc.start();
    this.isMusicPlaying = true;
    
    // Simple melody loop
    let note = 0;
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    const interval = setInterval(() => {
      if (!this.isMusicPlaying || !this.musicOsc || !this.ctx) {
        clearInterval(interval);
        return;
      }
      this.musicOsc.frequency.setTargetAtTime(notes[note % notes.length], this.ctx.currentTime, 0.1);
      note++;
    }, 500);
  }

  public stopMusic() {
    if (this.musicOsc) {
      this.musicOsc.stop();
      this.musicOsc.disconnect();
      this.musicOsc = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundManager = new SoundManager();
