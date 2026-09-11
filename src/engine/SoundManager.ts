export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private blizzardNode: AudioNode | null = null;
  private blizzardGain: GainNode | null = null;

  constructor() {
    // Lazy init audio context on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.blizzardGain && this.ctx) {
      this.blizzardGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Shovel crunch sound (シャクッ)
  public playShovel() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // White noise for snow crunch
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for crisp snow sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.15);
  }

  // Heavy breathing sound (ゼーハー)
  public playBreath() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.4);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Low frequency heartbeat pulse when stamina is low
  public playHeartbeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Roof creak warning sound (ギギギ...)
  public playWarningCreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.3);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Avalanche fall rumble (ドザーッ)
  public playAvalanche() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(80, t + 1.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 1.2);
  }

  // Snowplow engine rumble (ブォォォン)
  public playSnowplow() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.5);
    osc.frequency.linearRampToValueAtTime(70, t + 2.0);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 2.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 2.2);
  }

  // Assistance / Volunteer arrival chime (ピンポン)
  public playChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(659.25, t); // E5
    osc2.frequency.setValueAtTime(523.25, t + 0.25); // C5

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.25);
    osc2.start(t + 0.25);
    osc2.stop(t + 0.75);
  }

  // Continuous Blizzard Background Wind noise
  public setBlizzardIntensity(intensity: number) {
    if (this.isMuted) {
      if (this.blizzardGain && this.ctx) {
        this.blizzardGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return;
    }
    this.initCtx();
    if (!this.ctx) return;

    if (!this.blizzardNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      // Pink noise simulation for wind
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // boost
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.03 * intensity;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.blizzardNode = noise;
      this.blizzardGain = gain;
    } else if (this.blizzardGain && this.ctx) {
      this.blizzardGain.gain.setTargetAtTime(0.04 * intensity, this.ctx.currentTime, 0.1);
    }
  }

  public stopBlizzard() {
    if (this.blizzardGain && this.ctx) {
      this.blizzardGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  // Emergency Ambulance Siren (ピーポーピーポー)
  public playAmbulance() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // ピー (960Hz) - ポー (770Hz) x 2
    osc.frequency.setValueAtTime(960, t);
    osc.frequency.setValueAtTime(770, t + 0.35);
    osc.frequency.setValueAtTime(960, t + 0.7);
    osc.frequency.setValueAtTime(770, t + 1.05);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.5);
  }

  // Car Horn & Skid (急ブレーキ＆クラクション)
  public playCarBrake() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Horn (プープー)
    const hornOsc = this.ctx.createOscillator();
    const hornGain = this.ctx.createGain();
    hornOsc.type = 'sawtooth';
    hornOsc.frequency.setValueAtTime(420, t);
    hornGain.gain.setValueAtTime(0.2, t);
    hornGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    hornOsc.connect(hornGain);
    hornGain.connect(this.ctx.destination);
    hornOsc.start(t);
    hornOsc.stop(t + 0.5);

    // Skid noise
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, t + 0.1);
    const skidGain = this.ctx.createGain();
    skidGain.gain.setValueAtTime(0.25, t + 0.1);
    skidGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    noise.connect(filter);
    filter.connect(skidGain);
    skidGain.connect(this.ctx.destination);
    noise.start(t + 0.1);
    noise.stop(t + 0.6);
  }

  // Day Clear Victory Fanfare (除雪完了ファンファーレ)
  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15, offset: 0 },    // C5
      { f: 659.25, d: 0.15, offset: 0.15 }, // E5
      { f: 783.99, d: 0.18, offset: 0.3 },  // G5
      { f: 1046.5, d: 0.55, offset: 0.48 }, // High C6
    ];

    notes.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.offset);

      gain.gain.setValueAtTime(0.28, t + note.offset);
      gain.gain.exponentialRampToValueAtTime(0.005, t + note.offset + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.offset);
      osc.stop(t + note.offset + note.d);
    });
  }

  // Tea Sip Sound (ズズッ...ふぅ)
  public playTeaSlurp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.15);
    osc.frequency.linearRampToValueAtTime(200, t + 0.35);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Tin Roof Footstep (屋根トタンのペコッ音)
  public playRoofCreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Heavy Snow Dumping from Roof to Ground (屋根から地上への雪落とし音 ドサッ)
  public playSnowDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.linearRampToValueAtTime(70, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.4);
  }

  // Slip & Fall from Roof (滑落SE)
  public playSlipFall() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Screech whistle down
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.6);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);

    // Ground impact thud
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(90, t + 0.55);
    thudOsc.frequency.exponentialRampToValueAtTime(30, t + 0.95);
    thudGain.gain.setValueAtTime(0.45, t + 0.55);
    thudGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(t + 0.55);
    thudOsc.stop(t + 1.0);
  }

  // Morning Curtain Open SE (カーテンをシャッと開ける音)
  public playCurtain() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(2600, t + 0.22);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.25);
  }

  // === Procedural Nostalgic Winter Music Box / Rhodes BGM ===
  private bgmTimer: number = 0;
  private isBgmPlaying: boolean = false;
  private bgmIndex: number = 0;

  // Gentle, melancholy & cozy winter progression (Cmaj7 - Am7 - Fmaj7 - G7 arpeggios)
  private readonly bgmNotes: number[] = [
    261.63, 329.63, 392.00, 493.88, // C4, E4, G4, B4
    220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
    174.61, 220.00, 261.63, 349.23, // F3, A3, C4, F4
    196.00, 246.94, 293.66, 392.00, // G3, B3, D4, G4
    261.63, 392.00, 523.25, 659.25, // C4, G4, C5, E5
    220.00, 329.63, 440.00, 523.25, // A3, E4, A4, C5
    174.61, 261.63, 349.23, 440.00, // F3, C4, F4, A4
    196.00, 293.66, 392.00, 493.88, // G3, D4, G4, B4
  ];

  public startBGM() {
    this.isBgmPlaying = true;
    this.bgmTimer = 0;
    this.bgmIndex = 0;
  }

  public stopBGM() {
    this.isBgmPlaying = false;
  }

  public updateBGM(isStaminaLow: boolean = false) {
    if (this.isMuted || !this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.bgmTimer++;
    // Play a gentle note every 40 frames (~0.66s per note)
    if (this.bgmTimer % 40 === 0) {
      const freq = this.bgmNotes[this.bgmIndex % this.bgmNotes.length];
      this.bgmIndex++;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine/triangle blend like a warm music box
      osc.type = isStaminaLow ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass filter to keep it very warm and unobtrusive
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isStaminaLow ? 500 : 1200, t);

      const volume = isStaminaLow ? 0.03 : 0.055;
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    }
  }
}

export const soundMgr = new SoundManager();
