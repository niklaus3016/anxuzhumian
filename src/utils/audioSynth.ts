// High-Fidelity Procedural Sound Synthesis Engine using Web Audio API
// Runs 100% offline with zero external audio assets. Includes smooth fades for start/stop.

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channels: Map<string, {
    gainNode: GainNode;
    sources: AudioNode[];
    timers: number[];
  }> = new Map();

  // White noise cache
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;

  // Chord loop timers
  private melodyInterval: any = null;

  constructor() {
    // Lazy-init AudioContext on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.buildBuffers();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Pre-generate standard noise buffers
  private buildBuffers() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of loop

    // White Noise
    this.whiteNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const whiteData = this.whiteNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      whiteData[i] = Math.random() * 2 - 1;
    }

    // Pink Noise (filtered white noise)
    this.pinkNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const pinkData = this.pinkNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      pinkData[i] *= 0.11; // estimate scaling
      b6 = white * 0.115926;
    }

    // Brown Noise
    this.brownNoiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const brownData = this.brownNoiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      brownData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brownData[i];
      brownData[i] *= 3.5; // boost gain
    }
  }

  private getNoiseSource(type: "white" | "pink" | "brown"): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    let buffer = this.whiteNoiseBuffer;
    if (type === "pink") buffer = this.pinkNoiseBuffer;
    if (type === "brown") buffer = this.brownNoiseBuffer;

    if (!buffer) return null;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  // --- INDIVIDUAL TRACK BUILDERS ---

  private buildRainTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const source = this.getNoiseSource("pink");
    if (!source) return [];

    // Filter to make it sound like soft pattering rain
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1000, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(2500, this.ctx.currentTime);

    // Dynamic wave modulation (adds subtle wind-blown density)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // very slow rain intensity
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gainNode);

    source.start(0);
    lfo.start(0);

    return [source, lfo, bandpass, lowpass];
  }

  private buildWavesTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const source = this.getNoiseSource("pink");
    if (!source) return [];

    // Low frequency ocean roll
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(320, this.ctx.currentTime);

    // LFO for wave pacing and washing sound
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5 seconds per wave

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    // Wave amplification modulator
    lfo.connect(waveGain);
    waveGain.connect(gainNode.gain);

    source.connect(lowpass);
    lowpass.connect(gainNode);

    source.start(0);
    lfo.start(0);

    return [source, lfo, lowpass, waveGain];
  }

  private buildBrookTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const source = this.getNoiseSource("white");
    if (!source) return [];

    // Filter sweep for bubbling liquid textures
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(12, this.ctx.currentTime); // High resonance

    // Modulate bandpass frequency quickly
    const modulation = this.ctx.createOscillator();
    modulation.type = "sine";
    modulation.frequency.setValueAtTime(2.2, this.ctx.currentTime); // Babbling rate

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(150, this.ctx.currentTime); // sweep between 1050Hz and 1350Hz

    modulation.connect(modGain);
    modGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(gainNode);

    source.start(0);
    modulation.start(0);

    return [source, filter, modulation, modGain];
  }

  private buildWindTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const source = this.getNoiseSource("brown");
    if (!source) return [];

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(300, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Slow drifting LFO to mimic occasional wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.04, this.ctx.currentTime); // 25s cycle ambient gust

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // shift frequency 180 to 420 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    source.connect(bandpass);
    bandpass.connect(gainNode);

    source.start(0);
    lfo.start(0);

    return [source, bandpass, lfo, lfoGain];
  }

  private buildSnowTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const source = this.getNoiseSource("pink");
    if (!source) return [];

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(3200, this.ctx.currentTime);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(7000, this.ctx.currentTime);

    // Very gentle slow breath simulation for snowfall
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);

    source.start(0);
    lfo.start(0);

    return [source, highpass, lowpass, lfo];
  }

  private buildCampfireTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const lowBase = this.getNoiseSource("brown");
    if (!lowBase) return [];

    // Low pass filter for fire's bass rumble
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(180, this.ctx.currentTime);

    lowBase.connect(lowpass);
    lowpass.connect(gainNode);
    lowBase.start(0);

    // Snaps and cracks generator
    // Generates occasional burst impulses representing wood popping
    const snapOsc = this.ctx!.createOscillator();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(80, this.ctx!.currentTime);

    const snapGain = this.ctx!.createGain();
    snapGain.gain.setValueAtTime(0.001, this.ctx!.currentTime); // quiet by default
    snapOsc.connect(snapGain);
    snapGain.connect(gainNode);
    snapOsc.start(0);

    // Loop interval to trigger crackle pops randomly in state
    const popTimers: number[] = [];

    const popTrigger = () => {
      if (!this.ctx || !this.masterGain) return;
      const delay = Math.random() * 1200 + 100;
      const timer = window.setTimeout(() => {
        try {
          if (!this.ctx) return;
          // Trigger a micro noise puff representing popping wood ember
          const osc = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          osc.type = Math.random() > 0.4 ? "sine" : "sawtooth";
          osc.frequency.setValueAtTime(Math.random() * 4000 + 400, this.ctx.currentTime);

          pGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
          pGain.gain.linearRampToValueAtTime(Math.random() * 0.15 + 0.05, this.ctx.currentTime + 0.003);
          pGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + Math.random() * 0.1 + 0.02);

          osc.connect(pGain);
          pGain.connect(gainNode);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {
          // safe trigger check
        }
        popTrigger();
      }, delay);
      popTimers.push(timer);
    };

    popTrigger();

    return [lowBase, lowpass, snapOsc, snapGain, ...popTimers as any[]];
  }

  // Pure Instruments (Ambient Piano, Guqin, Guzheng, Celestial Chimes)

  private buildPianoTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    
    // We compose an ambient progressions player
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // C Major 7 (C3, E3, G3, B3)
      [110.00, 130.81, 164.81, 220.00], // A Minor 7 (A2, C3, E3, A3)
      [87.31, 130.81, 174.61, 220.00],  // F Major 7 (F2, C3, F3, A3)
      [98.00, 146.83, 196.00, 246.94]   // G Major 6/7 (G2, D3, G3, B3)
    ];

    let chordIdx = 0;
    const notesTimers: number[] = [];

    const playAmbientChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      // Arpeggiate chord notes over 3 seconds
      notes.forEach((freq, idx) => {
        const arpeggioDelay = idx * (Math.random() * 0.4 + 0.3);
        const timer = window.setTimeout(() => {
          if (!this.ctx) return;
          try {
            this.triggerWarmNote(freq, 4.0, gainNode);
          } catch (e) {}
        }, arpeggioDelay * 1000);
        notesTimers.push(timer);
      });

      // Repeat chord loop every 8 seconds
      const repeatTimer = window.setTimeout(playAmbientChord, 9000);
      notesTimers.push(repeatTimer);
    };

    playAmbientChord();

    // Connect dummy node so context is active
    const dummyOsc = this.ctx.createOscillator();
    const dummyGain = this.ctx.createGain();
    dummyGain.gain.setValueAtTime(0, this.ctx.currentTime);
    dummyOsc.connect(dummyGain);
    dummyGain.connect(gainNode);
    dummyOsc.start(0);

    return [dummyOsc, dummyGain, ...notesTimers as any[]];
  }

  private triggerWarmNote(freq: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Fundamental warm sine
    const osc1 = this.ctx.createOscillator();
    osc1.frequency.setValueAtTime(freq, now);
    osc1.type = "sine";

    // Ambient sub octave (for rich body)
    const osc2 = this.ctx.createOscillator();
    osc2.frequency.setValueAtTime(freq * 0.5, now);
    osc2.type = "sine";

    // Soft chime harmonic
    const osc3 = this.ctx.createOscillator();
    osc3.frequency.setValueAtTime(freq * 3.0, now);
    osc3.type = "sine";

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0, now);
    noteGain.gain.linearRampToValueAtTime(0.12, now + 0.15); // soft attach
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // slow release

    // Low pass filter to remove harsh clicking
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);

    // Simple echo delay
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.38, now);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.3, now);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);

    filter.connect(noteGain);
    
    // Wire up echo feedback
    noteGain.connect(dest);
    noteGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(dest);
    delayGain.connect(delay); // loop back

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration + 1);
    osc2.stop(now + duration + 1);
    osc3.stop(now + duration + 1);
  }

  // Guzheng string plucking
  private buildGuzhengTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    // Pentatonic scale G Major
    const scale = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88];
    const notesTimers: number[] = [];

    const playScaleLoop = () => {
      if (!this.ctx) return;
      
      // Pluck a random note
      const randFreq = scale[Math.floor(Math.random() * scale.length)];
      try {
        this.triggerStringPluck(randFreq, 3.5, gainNode);
      } catch (e) {}

      // Pluck next note in 2 to 4.5 seconds
      const nextDelay = Math.random() * 2500 + 1500;
      const timer = window.setTimeout(playScaleLoop, nextDelay);
      notesTimers.push(timer);
    };

    playScaleLoop();

    const dummyOsc = this.ctx.createOscillator();
    const dummyGain = this.ctx.createGain();
    dummyGain.gain.setValueAtTime(0, this.ctx.currentTime);
    dummyOsc.connect(dummyGain);
    dummyGain.connect(gainNode);
    dummyOsc.start(0);

    return [dummyOsc, dummyGain, ...notesTimers as any[]];
  }

  private triggerStringPluck(freq: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth"; // sharp guitar-like pluck
    osc.frequency.setValueAtTime(freq, now);

    // Warm dampening filter sweep
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(freq * 1.5, now);
    bandpass.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.5);
    bandpass.Q.setValueAtTime(4.0, now);

    // Pluck gain envelope
    const pGain = this.ctx.createGain();
    pGain.gain.setValueAtTime(0.0, now);
    pGain.gain.linearRampToValueAtTime(0.18, now + 0.008); // micro fast attack
    pGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Tremolo modulation
    const tremolo = this.ctx.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.setValueAtTime(6.0, now); // vibrato
    const tremoloGain = this.ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.02, now);

    // Connect pitch wobble
    tremolo.connect(tremoloGain);
    tremoloGain.connect(osc.frequency);

    osc.connect(bandpass);
    bandpass.connect(pGain);
    pGain.connect(dest);

    osc.start(now);
    tremolo.start(now);
    osc.stop(now + duration);
    tremolo.stop(now + duration);
  }

  // Guqin (lower register)
  private buildGuqinTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    // Deep notes G Pentatonic
    const scale = [98.00, 110.00, 123.47, 146.83, 164.81, 196.00];
    const notesTimers: number[] = [];

    const playGuqinLoop = () => {
      if (!this.ctx) return;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      try {
        this.triggerGuqinNote(freq, 4.5, gainNode);
      } catch (e) {}

      const nextDelay = Math.random() * 4000 + 3000;
      const timer = window.setTimeout(playGuqinLoop, nextDelay);
      notesTimers.push(timer);
    };

    playGuqinLoop();

    const dummyOsc = this.ctx.createOscillator();
    const dummyGain = this.ctx.createGain();
    dummyGain.gain.setValueAtTime(0, this.ctx.currentTime);
    dummyOsc.connect(dummyGain);
    dummyGain.connect(gainNode);
    dummyOsc.start(0);

    return [dummyOsc, dummyGain, ...notesTimers as any[]];
  }

  private triggerGuqinNote(freq: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    
    // Simulate fingers sliding on silk strings (occasional slide pitch shift)
    if (Math.random() > 0.4) {
      const destinationFreq = freq * (Math.random() > 0.5 ? 1.125 : 0.888);
      osc.frequency.exponentialRampToValueAtTime(destinationFreq, now + 1.2);
    }

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(350, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0, now);
    nGain.gain.linearRampToValueAtTime(0.2, now + 0.12); // slow slide-on attach
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(lowpass);
    lowpass.connect(nGain);
    nGain.connect(dest);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Zen Ancient Bell Sound
  private buildZenBellTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    const notesTimers: number[] = [];

    const playBellLoop = () => {
      if (!this.ctx) return;
      try {
        // deep relaxing gong chime (110Hz or 146.8Hz)
        const root = Math.random() > 0.5 ? 110 : 73.42;
        this.triggerZenGong(root, 8.0, gainNode);
      } catch (e) {}

      const timer = window.setTimeout(playBellLoop, 15000); // sound bell every 15s
      notesTimers.push(timer);
    };

    playBellLoop();

    const dummyOsc = this.ctx.createOscillator();
    const dummyGain = this.ctx.createGain();
    dummyGain.gain.setValueAtTime(0, this.ctx.currentTime);
    dummyOsc.connect(dummyGain);
    dummyGain.connect(gainNode);
    dummyOsc.start(0);

    return [dummyOsc, dummyGain, ...notesTimers as any[]];
  }

  private triggerZenGong(freq: number, duration: number, dest: AudioNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Harmonic chimes for deep metal gong resonant components
    const harmonics = [1.0, 2.0, 2.76, 3.42, 4.3, 5.2];
    const amplitudes = [0.25, 0.12, 0.08, 0.04, 0.02, 0.01];

    harmonics.forEach((mult, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * mult, now);

      const hGain = this.ctx.createGain();
      hGain.gain.setValueAtTime(0, now);
      hGain.gain.linearRampToValueAtTime(amplitudes[idx], now + 0.012); // rapid hit
      // Higher partials decay faster
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + (duration / mult));

      osc.connect(hGain);
      hGain.connect(dest);
      osc.start(now);
      osc.stop(now + duration + 1);
    });
  }

  // Tinnitus therapeutic beats / custom oscillator
  private buildTinnitusTrack(gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];

    // Left and right ear customized therapeutic binaural oscillators
    // User can set the frequency later. For now let's set a default 4000Hz (common tinnitus pitch)
    // Left ear
    const oscL = this.ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.setValueAtTime(4000, this.ctx.currentTime);

    // Right ear (slightly detuned by 6Hz to create binaural state representing deep calmness)
    const oscR = this.ctx.createOscillator();
    oscR.type = "sine";
    oscR.frequency.setValueAtTime(4006, this.ctx.currentTime);

    // We can merge with panners or simply wire together
    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pannerL && pannerR) {
      pannerL.pan.setValueAtTime(-0.8, this.ctx.currentTime);
      pannerR.pan.setValueAtTime(0.8, this.ctx.currentTime);
      oscL.connect(pannerL);
      oscR.connect(pannerR);
      pannerL.connect(gainNode);
      pannerR.connect(gainNode);
    } else {
      oscL.connect(gainNode);
      oscR.connect(gainNode);
    }

    oscL.start(0);
    oscR.start(0);

    return [oscL, oscR, pannerL, pannerR].filter(Boolean) as AudioNode[];
  }

  // Set frequency for tinnitus therapeutical
  public setTinnitusFrequency(freq: number) {
    const channel = this.channels.get("tinnitus");
    if (!channel) return;
    const now = this.ctx ? this.ctx.currentTime : 0;
    channel.sources.forEach((source) => {
      if (source instanceof OscillatorNode) {
        // Set L and R detuned
        if (source.frequency.value > freq + 2) {
          source.frequency.setValueAtTime(freq + 6, now);
        } else {
          source.frequency.setValueAtTime(freq, now);
        }
      }
    });
  }

  // Atmospheric sounds: distant cafe or library hum
  private buildAtmosphereTrack(type: string, gainNode: GainNode): AudioNode[] {
    if (!this.ctx) return [];
    
    // Distant murmurs represented by lowpassed brown/pink noise 
    // with occasional random acoustic frequency clusters
    const baseSource = this.getNoiseSource("pink");
    if (!baseSource) return [];

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(250, this.ctx.currentTime); // heavily muffled 

    baseSource.connect(lowpass);
    lowpass.connect(gainNode);
    baseSource.start(0);

    const timers: number[] = [];
    const scale = type === "library" ? [220, 260, 330, 440] : [350, 480, 520, 680];

    // Background distant keyboard clicks or gentle mug/clinking
    const triggerMuffledSparks = () => {
      if (!this.ctx) return;
      const chance = Math.random();
      const delay = chance * 4000 + 1000;
      const t = window.setTimeout(() => {
        if (!this.ctx) return;
        try {
          const spark = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          spark.type = Math.random() > 0.7 ? "triangle" : "sine";
          
          // Library: soft pages flutter or sigh. Cafe: soft utensil clink
          const freq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() * 0.2 + 0.9);
          spark.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const bp = this.ctx.createBiquadFilter();
          bp.type = "bandpass";
          bp.frequency.setValueAtTime(freq, this.ctx.currentTime);
          bp.Q.setValueAtTime(type === "library" ? 2.5 : 8, this.ctx.currentTime);

          pGain.gain.setValueAtTime(0, this.ctx.currentTime);
          pGain.gain.linearRampToValueAtTime(type === "library" ? 0.05 : 0.08, this.ctx.currentTime + 0.02);
          pGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

          spark.connect(bp);
          bp.connect(pGain);
          pGain.connect(gainNode);

          spark.start();
          spark.stop(this.ctx.currentTime + 0.5);
        } catch (e) {}

        triggerMuffledSparks();
      }, delay);
      timers.push(t);
    };

    triggerMuffledSparks();

    return [baseSource, lowpass, ...timers as any[]];
  }

  // --- GENERAL CONTROLS ---

  public toggleTrack(id: string, play: boolean, volumePercent: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (play) {
      // Start channel sound
      if (this.channels.has(id)) {
        this.setTrackVolume(id, volumePercent);
        return;
      }

      const channelGain = this.ctx.createGain();
      // Smooth fade-in
      channelGain.gain.setValueAtTime(0, this.ctx.currentTime);
      channelGain.connect(this.masterGain);

      let sourcesAndTimers: any[] = [];
      if (id === "rain") sourcesAndTimers = this.buildRainTrack(channelGain);
      else if (id === "waves") sourcesAndTimers = this.buildWavesTrack(channelGain);
      else if (id === "brook") sourcesAndTimers = this.buildBrookTrack(channelGain);
      else if (id === "wind") sourcesAndTimers = this.buildWindTrack(channelGain);
      else if (id === "snow") sourcesAndTimers = this.buildSnowTrack(channelGain);
      else if (id === "campfire") sourcesAndTimers = this.buildCampfireTrack(channelGain);
      else if (id === "piano") sourcesAndTimers = this.buildPianoTrack(channelGain);
      else if (id === "guzheng") sourcesAndTimers = this.buildGuzhengTrack(channelGain);
      else if (id === "guqin") sourcesAndTimers = this.buildGuqinTrack(channelGain);
      else if (id === "zenbell") sourcesAndTimers = this.buildZenBellTrack(channelGain);
      else if (id === "tinnitus") sourcesAndTimers = this.buildTinnitusTrack(channelGain);
      else if (id === "library") sourcesAndTimers = this.buildAtmosphereTrack("library", channelGain);
      else if (id === "cafe") sourcesAndTimers = this.buildAtmosphereTrack("cafe", channelGain);

      // Separate timers from audio node sources
      const sources: AudioNode[] = [];
      const timers: number[] = [];
      sourcesAndTimers.forEach((item) => {
        if (typeof item === "number") {
          timers.push(item);
        } else if (item) {
          sources.push(item);
        }
      });

      this.channels.set(id, {
        gainNode: channelGain,
        sources,
        timers,
      });

      // Linear fade-in of track over 1.5 seconds
      const targetGain = volumePercent / 100;
      channelGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 1.5);
    } else {
      // Stop channel sound with elegant fade-out
      const channel = this.channels.get(id);
      if (channel) {
        const currentGainNode = channel.gainNode;
        const now = this.ctx.currentTime;
        
        // Rapid exponential slide to mute to avoid pops
        currentGainNode.gain.cancelScheduledValues(now);
        currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, now);
        currentGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        // Remove from list after fade-out
        window.setTimeout(() => {
          // Clear all timeouts associated
          channel.timers.forEach((t) => window.clearTimeout(t));
          // Stop sources
          channel.sources.forEach((node) => {
            try {
              if (node instanceof AudioScheduledSourceNode) {
                node.stop();
              }
            } catch (e) {}
          });
          // Disconnect gain
          try {
            currentGainNode.disconnect();
          } catch (e) {}
        }, 1300);

        this.channels.delete(id);
      }
    }
  }

  public setTrackVolume(id: string, volumePercent: number) {
    const channel = this.channels.get(id);
    if (channel && this.ctx) {
      const target = volumePercent / 100;
      const now = this.ctx.currentTime;
      // Linear ramp to avoid popping noises
      channel.gainNode.gain.linearRampToValueAtTime(target, now + 0.1);
    }
  }

  public stopAll() {
    // Elegant fade out master to 0, then tear down
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);

      setTimeout(() => {
        this.forceTearDown();
      }, 1600);
    } else {
      this.forceTearDown();
    }
  }

  private forceTearDown() {
    this.channels.forEach((channel) => {
      channel.timers.forEach((t) => window.clearTimeout(t));
      channel.sources.forEach((node) => {
        try {
          if (node instanceof AudioScheduledSourceNode) {
            node.stop();
          }
        } catch (e) {}
      });
      try {
        channel.gainNode.disconnect();
      } catch (e) {}
    });
    this.channels.clear();
    
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
      this.masterGain = null;
    }
  }

  // --- GUIDED MEDITATION CHIMES / VOCALS EMBED ---
  // Generate beautiful peaceful drone to sustain during meditation classes!
  private breathingDroneOsc: OscillatorNode | null = null;
  private breathingDroneGain: GainNode | null = null;

  public toggleBreathingDrone(play: boolean, volumePercent: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (play) {
      if (this.breathingDroneOsc) return;

      const now = this.ctx.currentTime;
      this.breathingDroneOsc = this.ctx.createOscillator();
      this.breathingDroneOsc.type = "sine";
      this.breathingDroneOsc.frequency.setValueAtTime(120, now); // deep calm base drone

      // Add a subtle wobbling LFO
      const wobble = this.ctx.createOscillator();
      wobble.frequency.setValueAtTime(0.1, now);
      const wobbleGain = this.ctx.createGain();
      wobbleGain.gain.setValueAtTime(1.5, now);
      wobble.connect(wobbleGain);
      wobbleGain.connect(this.breathingDroneOsc.frequency);

      this.breathingDroneGain = this.ctx.createGain();
      this.breathingDroneGain.gain.setValueAtTime(0, now);
      this.breathingDroneGain.connect(this.masterGain);

      this.breathingDroneOsc.connect(this.breathingDroneGain);
      wobble.start(now);
      this.breathingDroneOsc.start(now);

      const target = volumePercent / 100 * 0.25; // keep it quiet
      this.breathingDroneGain.gain.linearRampToValueAtTime(target, now + 2.0);
    } else {
      if (this.breathingDroneOsc && this.breathingDroneGain) {
        const now = this.ctx.currentTime;
        this.breathingDroneGain.gain.linearRampToValueAtTime(0.0, now + 1.5);
        const oscToStop = this.breathingDroneOsc;
        setTimeout(() => {
          try {
            oscToStop.stop();
          } catch(e){}
        }, 1600);
        this.breathingDroneOsc = null;
        this.breathingDroneGain = null;
      }
    }
  }

  public playGuideChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Heavenly dual sine bell
    const osc1 = this.ctx.createOscillator();
    osc1.frequency.setValueAtTime(523.25, now); // C5
    const osc2 = this.ctx.createOscillator();
    osc2.frequency.setValueAtTime(659.25, now); // E5

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.2);
    osc2.stop(now + 3.2);
  }

  // Synthesis-based alarm bell ringing
  private alarmInterval: any = null;
  public startAlarmChimeSequence() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopAlarmChimeSequence();

    const ring = () => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      // Sunrise morning birds simulation or soft wooden xylophone
      for (let i = 0; i < 3; i++) {
        const triggerTime = now + (i * 0.3);
        const osc = this.ctx.createOscillator();
        const flt = this.ctx.createBiquadFilter();
        const gn = this.ctx.createGain();

        // High pitch pleasant birds flutter
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200 + (i * 200) + Math.random()*100, triggerTime);
        // slide the pitch rapidly up like a chirp
        osc.frequency.exponentialRampToValueAtTime(1800 + Math.random()*200, triggerTime + 0.12);

        flt.type = "bandpass";
        flt.frequency.setValueAtTime(1500, triggerTime);

        gn.gain.setValueAtTime(0, triggerTime);
        gn.gain.linearRampToValueAtTime(0.06, triggerTime + 0.01);
        gn.gain.exponentialRampToValueAtTime(0.0001, triggerTime + 0.22);

        osc.connect(flt);
        flt.connect(gn);
        gn.connect(this.masterGain);

        osc.start(triggerTime);
        osc.stop(triggerTime + 0.3);
      }
    };

    ring(); // ring once immediately
    this.alarmInterval = setInterval(ring, 1800);
  }

  public stopAlarmChimeSequence() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const audioSynth = new AudioSynthEngine();
