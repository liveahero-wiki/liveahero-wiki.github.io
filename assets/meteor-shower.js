/**
 * Meteor Shower Animation
 *
 * With optional ambient sound (off by default; the 🔇/🔊 button beside 🌟), synthesized with the
 * Web Audio API: a space background (wind noise + a slow pad), a whoosh per meteor and a crystal
 * chime when it shatters. Every pitch is in D major pentatonic, so nothing ever clashes.
 *
 * This file is concatenated into assets/site.js in production (wiki_plugins/minify-js.js), so it
 * must not declare anything outside the IIFE.
 */

(function () {
  // Config
  const CONFIG = {
    meteorSpeed: 1.5, // Base speed
    meteorSize: 24, // Head size
    meteorCount: 10, // Max concurrent meteors
    meteorTailLength: 150,
    meteorTailWidth: 10,
    meteorHeadImageSrc: 'https://liveahero-wiki.github.io/cdn/Sprite/item_stone01.png',
    particleCount: 5,
    particleSize: 5,
    particleLife: 30, // Frames
    audioVolume: 0.5, // Master volume of the sound (0..1)
  };

  const PARTICLE_GLOW = [
    {r: 100, g: 100, b: 255},
    {r: 100, g: 200, b: 100},
    {r: 155, g: 50, b: 155},
  ]

  function createMeteorWithFilter(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CONFIG.meteorSize * 2;
    canvas.height = CONFIG.meteorSize * 2;
    ctx.filter = `drop-shadow(0 0 ${CONFIG.meteorSize * 0.3}px #fff)`;
    ctx.drawImage(img, CONFIG.meteorSize / 2, CONFIG.meteorSize / 2, CONFIG.meteorSize, CONFIG.meteorSize);
    return canvas;
  }

  // Assets
  const meteorImage = new Image();
  let meteorImageData = null;
  meteorImage.onload = () => {
    meteorImageData = createMeteorWithFilter(meteorImage);
  };
  meteorImage.src = CONFIG.meteorHeadImageSrc;

  // Settings (localStorage can throw, e.g. with site data blocked)
  const meteorAnimKey = "meteor";
  const meteorSoundKey = "meteorSound";
  function readSetting(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === "true";
    } catch (e) {
      return fallback;
    }
  }
  function writeSetting(key, value) {
    try {
      localStorage.setItem(key, value ? "true" : "false");
    } catch (e) {
      // not remembered
    }
  }

  // State
  let isRunning = readSetting(meteorAnimKey, true);
  let soundEnabled = readSetting(meteorSoundKey, false);
  let meteors = [];
  let particles = [];
  let canvas, ctx;
  let width, height;
  let animationFrameId;
  let soundBtn;

  // Audio engine. Nothing is created until start() is first called (from a click or keypress, as
  // browsers require); every other call is a no-op while the sound is off.
  const audio = (() => {
    // Levels of each layer; tune here.
    const MIX = {
      wind: 0.15, // low rumbling noise
      air: 0.05, // faint high hiss drifting left and right
      padVoice: 0.045, // each of the 3 pad notes
      whoosh: 0.08, // per meteor
      chime: 0.11, // per shatter
      reverb: 0.6,
    };
    // D major pentatonic: degree 0 is D2, 5 is D3, -1 is B1, and so on.
    const SCALE = [0, 2, 4, 7, 9];
    const D2 = 73.416;
    // Pad chords, only from scale notes: Dsus2, Bm, Esus, Asus.
    const CHORDS = [[0, 3, 6], [-1, 2, 5], [1, 4, 7], [-2, 1, 4]];
    const PAD_LFO_RATES = [0.043, 0.071, 0.109];
    // Chime pitch range (D5..B6) and the bell's partials: [frequency ratio, amplitude, decay seconds].
    const CHIME_LOW = 15;
    const CHIME_HIGH = 24;
    const PARTIALS = [[1, 1, 1.8], [2, 0.4, 1.0], [3.01, 0.2, 0.5], [4.17, 0.1, 0.3]];

    let ac = null;
    let master, dry, reverbIn, padBus;
    let whiteBuf, brownBuf;
    let active = false; // meant to be audible
    let unlocked = false; // has been running once, so it may resume without a gesture
    let stopTimer = 0;
    let chordTimer = 0;
    let chordIdx = 0;
    let pad = null;
    let lastDegree = 18;
    const impacts = []; // times of recent shatters, for the density limiter

    function degreeFreq(n) {
      const octave = Math.floor(n / 5);
      return D2 * Math.pow(2, octave + SCALE[n - octave * 5] / 12);
    }

    function panFor(x) {
      return Math.max(-1, Math.min(1, (x / width) * 2 - 1));
    }

    // Stops the automation of `param` at time t, keeping its current value.
    function hold(param, t) {
      if (param.cancelAndHoldAtTime) {
        param.cancelAndHoldAtTime(t);
      } else {
        const value = param.value;
        param.cancelScheduledValues(t);
        param.setValueAtTime(value, t);
      }
    }

    // A loopable noise buffer: the end is crossfaded into the start so that the loop has no click.
    function makeNoise(seconds, channels, brown) {
      const rate = ac.sampleRate;
      const len = Math.floor(rate * seconds);
      const fade = Math.floor(rate * 0.5);
      const buf = ac.createBuffer(channels, len, rate);
      for (let ch = 0; ch < channels; ch++) {
        const raw = new Float32Array(len + fade);
        let last = 0;
        for (let i = 0; i < raw.length; i++) {
          const white = Math.random() * 2 - 1;
          if (brown) {
            last = (last + 0.02 * white) / 1.02;
            raw[i] = last * 3.5;
          } else {
            raw[i] = white;
          }
        }
        const data = buf.getChannelData(ch);
        data.set(raw.subarray(0, len));
        for (let i = 0; i < fade; i++) {
          const k = i / fade;
          data[i] = raw[i] * Math.sqrt(k) + raw[len + i] * Math.sqrt(1 - k);
        }
      }
      return buf;
    }

    // Reverb impulse: decaying noise that gets darker as it fades, after a short pre-delay.
    function makeImpulse(seconds) {
      const rate = ac.sampleRate;
      const len = Math.floor(rate * seconds);
      const preDelay = Math.floor(rate * 0.02);
      const buf = ac.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        let lp = 0;
        for (let i = preDelay; i < len; i++) {
          const pos = i / len;
          lp += (0.6 - 0.45 * pos) * (Math.random() * 2 - 1 - lp);
          data[i] = lp * Math.pow(1 - pos, 3);
        }
      }
      return buf;
    }

    // Sends `node` to the dry bus and, `send` loud, to the reverb.
    function route(node, send) {
      node.connect(dry);
      if (send > 0) {
        const g = ac.createGain();
        g.gain.value = send;
        node.connect(g);
        g.connect(reverbIn);
      }
    }

    // A slow oscillator wobbling `param` by ±depth around its value. Returns the (started) oscillator.
    function lfo(param, rate, depth) {
      const osc = ac.createOscillator();
      osc.frequency.value = rate;
      const g = ac.createGain();
      g.gain.value = depth;
      osc.connect(g);
      g.connect(param);
      osc.start();
      return osc;
    }

    function build() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      try {
        ac = new AudioContext();
      } catch (e) {
        return false;
      }

      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.01;
      comp.release.value = 0.3;
      comp.connect(ac.destination);

      master = ac.createGain();
      master.gain.value = 0;
      master.connect(comp);

      dry = ac.createGain();
      dry.connect(master);

      const reverb = ac.createConvolver();
      reverb.buffer = makeImpulse(4);
      reverbIn = ac.createGain();
      reverbIn.connect(reverb);
      const wet = ac.createGain();
      wet.gain.value = MIX.reverb;
      reverb.connect(wet);
      wet.connect(master);

      whiteBuf = makeNoise(6, 1, false);
      brownBuf = makeNoise(6, 2, true);

      startAmbience();
      return true;
    }

    function startAmbience() {
      // Cosmic wind: low brown noise, its brightness and level drifting slowly.
      const wind = ac.createBufferSource();
      wind.buffer = brownBuf;
      wind.loop = true;
      const windFilter = ac.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 350;
      windFilter.Q.value = 0.7;
      lfo(windFilter.frequency, 0.031, 180);
      const windGain = ac.createGain();
      windGain.gain.value = MIX.wind;
      lfo(windGain.gain, 0.017, MIX.wind * 0.5);
      wind.connect(windFilter);
      windFilter.connect(windGain);
      route(windGain, 0.3);
      wind.start();

      // Air: a faint band of hiss wandering across the stereo field.
      const air = ac.createBufferSource();
      air.buffer = whiteBuf;
      air.loop = true;
      const airFilter = ac.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.value = 1200;
      airFilter.Q.value = 0.8;
      lfo(airFilter.frequency, 0.013, 500);
      const airPan = ac.createStereoPanner();
      lfo(airPan.pan, 0.023, 0.7);
      const airGain = ac.createGain();
      airGain.gain.value = MIX.air;
      air.connect(airFilter);
      airFilter.connect(airPan);
      airPan.connect(airGain);
      route(airGain, 0.5);
      air.start();

      // Pad: a soft chord that changes every minute or so.
      padBus = ac.createBiquadFilter();
      padBus.type = 'lowpass';
      padBus.frequency.value = 900;
      padBus.Q.value = 0.5;
      lfo(padBus.frequency, 0.021, 250);
      route(padBus, 0.7);
      pad = playChord(chordIdx, 6);
    }

    // Starts a pad chord, fading in over `fade` seconds. Returns {out, nodes} for crossfading it out.
    function playChord(idx, fade) {
      const t = ac.currentTime;
      const out = ac.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(1, t + fade);
      out.connect(padBus);
      const nodes = [];
      CHORDS[idx].forEach((degree, i) => {
        const freq = degreeFreq(degree);
        const voice = ac.createGain();
        voice.gain.value = MIX.padVoice;
        nodes.push(lfo(voice.gain, PAD_LFO_RATES[i] * (0.8 + Math.random() * 0.4), MIX.padVoice * 0.55));
        const sine = ac.createOscillator();
        sine.frequency.value = freq;
        const tri = ac.createOscillator();
        tri.type = 'triangle';
        tri.frequency.value = freq;
        tri.detune.value = i % 2 ? 7 : -7;
        const triGain = ac.createGain();
        triGain.gain.value = 0.3;
        sine.connect(voice);
        tri.connect(triGain);
        triGain.connect(voice);
        voice.connect(out);
        sine.start(t);
        tri.start(t);
        nodes.push(sine, tri);
      });
      return { out, nodes };
    }

    function nextChord() {
      if (ac.state !== 'running') return;
      const fade = 8;
      const t = ac.currentTime;
      const old = pad;
      chordIdx = (chordIdx + 1 + (Math.random() < 0.35 ? 1 : 0)) % CHORDS.length;
      pad = playChord(chordIdx, fade);
      hold(old.out.gain, t);
      old.out.gain.linearRampToValueAtTime(0, t + fade);
      old.nodes.forEach((node) => node.stop(t + fade + 0.1));
      old.nodes[0].onended = () => old.out.disconnect();
    }

    function scheduleChord() {
      chordTimer = setTimeout(() => {
        nextChord();
        scheduleChord();
      }, (40 + Math.random() * 30) * 1000);
    }

    function live() {
      return active && ac !== null && ac.state === 'running';
    }

    return {
      /** Fades the sound in. Resolves once the browser has (or has not) let it start. */
      start() {
        if (!ac && !build()) return Promise.resolve();
        active = true;
        clearTimeout(stopTimer);
        const t = ac.currentTime;
        hold(master.gain, t);
        master.gain.linearRampToValueAtTime(CONFIG.audioVolume, t + 3);
        if (!chordTimer) scheduleChord();
        return ac.resume().then(() => {
          if (ac.state === 'running') unlocked = true;
        }, () => {});
      },

      /** Fades the sound out, then suspends the context so that it costs nothing. */
      stop() {
        active = false;
        clearTimeout(chordTimer);
        chordTimer = 0;
        if (!ac) return;
        const t = ac.currentTime;
        hold(master.gain, t);
        master.gain.linearRampToValueAtTime(0, t + 0.8);
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => {
          if (!active) ac.suspend();
        }, 900);
      },

      playing() {
        return live();
      },

      unlocked() {
        return unlocked;
      },

      /** Starts the whoosh of a new meteor, sweeping down over its predicted flight. */
      whoosh(m) {
        if (!live()) return null;
        const frames = Math.max(30, Math.min(m.x / -m.vx, (height - m.y) / m.vy));
        const dur = frames / 60;
        const t = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = whiteBuf;
        src.loop = true;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1.2 + Math.random() * 2.8;
        filter.frequency.setValueAtTime(2500 + Math.random() * 700, t);
        filter.frequency.exponentialRampToValueAtTime(600 + Math.random() * 250, t + dur);
        const peak = MIX.whoosh * (m.size / CONFIG.meteorSize);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.4);
        g.gain.exponentialRampToValueAtTime(peak * 0.5, t + dur);
        const pan = ac.createStereoPanner();
        pan.pan.value = panFor(m.x);
        src.connect(filter);
        filter.connect(g);
        g.connect(pan);
        route(pan, 0.25);
        src.start(t, Math.random() * 5);
        src.stop(t + dur + 1); // in case it is never released
        src.onended = () => pan.disconnect();
        return { src, g, pan, lastPan: pan.pan.value };
      },

      /** Moves a meteor's whoosh across the stereo field with it. */
      follow(m) {
        const voice = m.voice;
        if (!voice || !ac) return;
        const p = panFor(m.x);
        if (Math.abs(p - voice.lastPan) < 0.02) return;
        voice.lastPan = p;
        voice.pan.pan.setTargetAtTime(p, ac.currentTime, 0.05);
      },

      release(voice) {
        if (!voice || !ac) return;
        const t = ac.currentTime;
        hold(voice.g.gain, t);
        voice.g.gain.setTargetAtTime(0, t, 0.04);
        voice.src.stop(t + 0.3);
      },

      /** A crystal breaking: a glassy tink, a bell note and a few tiny shards. */
      shatter(x, size) {
        if (!live()) return;
        const t = ac.currentTime + 0.005;

        const now = performance.now();
        while (impacts.length && now - impacts[0] > 2000) impacts.shift();
        const level = MIX.chime * (size / CONFIG.meteorSize) / Math.sqrt(1 + 0.4 * impacts.length);
        impacts.push(now);

        const center = panFor(x) * 0.8;
        const pan = ac.createStereoPanner();
        pan.pan.value = center;
        route(pan, 0.9);

        // Tink
        const noise = ac.createBufferSource();
        noise.buffer = whiteBuf;
        const hp = ac.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 4500;
        const tink = ac.createGain();
        tink.gain.setValueAtTime(level * 0.3, t);
        tink.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        noise.connect(hp);
        hp.connect(tink);
        tink.connect(pan);
        noise.start(t, Math.random() * 5);
        noise.stop(t + 0.08);

        // Bell: the note takes a small step from the previous one, so the chimes form a melody.
        const step = [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)];
        let degree = lastDegree + step;
        if (degree < CHIME_LOW || degree > CHIME_HIGH) degree = lastDegree - step;
        lastDegree = degree;
        const freq = degreeFreq(degree);
        let longest = null;
        PARTIALS.forEach(([ratio, amp, decay]) => {
          const osc = ac.createOscillator();
          osc.frequency.value = freq * ratio;
          osc.detune.value = (Math.random() - 0.5) * 6;
          const g = ac.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(level * amp, t + 0.003);
          g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
          osc.connect(g);
          g.connect(pan);
          osc.start(t);
          osc.stop(t + decay + 0.05);
          longest = longest || osc;
        });
        longest.onended = () => pan.disconnect();

        // Shards, one per star particle
        for (let i = 0; i < CONFIG.particleCount; i++) {
          const start = t + 0.03 + Math.random() * 0.37;
          const decay = 0.12 + Math.random() * 0.08;
          const osc = ac.createOscillator();
          osc.frequency.value = Math.min(5000, degreeFreq(degree + 5 + Math.floor(Math.random() * 6)));
          const g = ac.createGain();
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(level * (0.18 + Math.random() * 0.12), start + 0.002);
          g.gain.exponentialRampToValueAtTime(0.0001, start + decay);
          const shardPan = ac.createStereoPanner();
          shardPan.pan.value = Math.max(-1, Math.min(1, center + (Math.random() - 0.5) * 0.6));
          osc.connect(g);
          g.connect(shardPan);
          route(shardPan, 0.9);
          osc.start(start);
          osc.stop(start + decay + 0.05);
          osc.onended = () => shardPan.disconnect();
        }
      },
    };
  })();

  // Classes
  class Meteor {
    constructor() {
      this.reset();
    }

    reset() {
      // Start from top or right
      // Randomly choose visible entry point
      if (Math.random() < 0.7) {
        // Top edge
        this.x = Math.random() * width * 1.5 - (width * 0.25); // Wide range to cover diagonals
        this.y = -CONFIG.meteorSize * 2 - Math.random() * 100;
      } else {
        // Right edge
        this.x = width + CONFIG.meteorSize * 2 + Math.random() * 100;
        this.y = Math.random() * height * 0.8 - (height * 0.2); // Start mostly upper part
      }

      // Normalize direction to be diagonal
      const angle = Math.PI * 0.75; // 135 degrees (bottom-left)
      const speed = CONFIG.meteorSpeed * (0.8 + Math.random() * 0.4);

      this.vx = Math.cos(angle) * speed * 3;
      this.vy = Math.sin(angle) * speed * 3;
      this.size = CONFIG.meteorSize * (0.8 + Math.random() * 0.4);
      this.dead = false;
      this.voice = audio.whoosh(this);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      audio.follow(this);

      // Collision with left or bottom edge
      if (this.x < 0 || this.y > height) {
        this.dead = true;
        this.explode();
      }
    }

    draw(ctx) {
      if (this.dead) return;

      // Draw Tail
      const gradient = ctx.createLinearGradient(
        this.x, this.y,
        this.x - this.vx * (CONFIG.meteorTailLength / 5),
        this.y - this.vy * (CONFIG.meteorTailLength / 5)
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = CONFIG.meteorTailWidth;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - this.vx * (CONFIG.meteorTailLength / 5),
        this.y - this.vy * (CONFIG.meteorTailLength / 5)
      );
      ctx.stroke();

      // Draw Head
      ctx.save();
      ctx.translate(this.x, this.y);
      // Rotate to match direction
      ctx.rotate(Math.atan2(this.vy, this.vx) - Math.PI / 4);
      ctx.drawImage(meteorImageData, -this.size, -this.size, this.size * 2, this.size * 2);
      ctx.restore();
    }

    explode() {
      audio.release(this.voice);
      this.voice = null;
      audio.shatter(this.x, this.size);
      // Create particles
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle(this.x, this.y, this.vx, this.vy));
      }
    }
  }

  class Particle {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      // Spread out
      const angle = (Math.random() - 0.5) * Math.PI; // Random spread
      const speed = Math.sqrt(vx * vx + vy * vy) * (0.3 + Math.random() * 0.4);
      this.vx = vx * 0.5 + Math.cos(angle) * speed;
      this.vy = vy * 0.5 + Math.sin(angle) * speed * -0.5; // Bounce up a bit?

      // Just scatter them randomly
      this.vx = (Math.random() - 0.5) * 5;
      this.vy = (Math.random() - 0.5) * 5;

      this.life = CONFIG.particleLife;
      this.maxLife = CONFIG.particleLife;

      this.glow = PARTICLE_GLOW[Math.floor(Math.random() * PARTICLE_GLOW.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
    }

    draw(ctx) {
      const alpha = this.life / this.maxLife;

      const angle = 0;
      const radius = CONFIG.particleSize;
      const points = 5;

      ctx.fillStyle = `rgba(${this.glow.r}, ${this.glow.g}, ${this.glow.b}, ${alpha*0.7})`;
      this.drawStar(ctx, points, angle, radius * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.drawStar(ctx, points, angle, radius);
      ctx.fill();
    }

    drawStar(ctx, points, angle, radius) {
      const step = Math.PI / points;
      ctx.beginPath();
      ctx.moveTo(this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius);
      for (let i = 1; i <= points; i++) {
        angle += step;
        ctx.lineTo(this.x + Math.cos(angle) * radius * 0.7, this.y + Math.sin(angle) * radius * 0.7);
        angle += step;
        ctx.lineTo(this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius);
      }
      ctx.closePath();
    }

    move(dir, scale) {
      return [this.x + dir.x * scale, this.y + dir.y * scale];
    }
  }

  // Initialization
  function init() {
    // Create UI
    createControls();

    // Create Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'meteor-shower-canvas';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');

    // Bind Events
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    document.addEventListener('visibilitychange', () => syncAudio(false));

    // Start Loop
    loop();
    syncAudio(false);
  }

  function createControls() {
    const style = document.createElement('style');
    style.textContent = `
      #meteor-shower-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999;
        pointer-events: none;
      }
      #meteor-btns {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #meteor-sound-btn {
        width: 34px;
        height: 34px;
        font-size: 16px;
      }
      #meteor-sound-btn.is-pending {
        opacity: 0.55;
      }
    `;
    document.head.appendChild(style);

    // #float-btns is the stack of round buttons in the corner (_sass/_floating-buttons.scss); the
    // page may have rendered it already (_includes/wiki-msg.html), and this button goes below the others.
    let container = document.getElementById('float-btns');
    const isNewContainer = !container;
    if (isNewContainer) {
      container = document.createElement('div');
      container.id = 'float-btns';
    }

    // A row in the stack: the small sound button to the left of 🌟
    const row = document.createElement('div');
    row.id = 'meteor-btns';

    soundBtn = document.createElement('button');
    soundBtn.id = 'meteor-sound-btn';
    soundBtn.className = 'float-btn';
    soundBtn.type = 'button';
    soundBtn.onclick = () => {
      // While it is on but waiting for a click, this click is the one that starts it.
      soundEnabled = !(soundEnabled && audio.playing());
      writeSetting(meteorSoundKey, soundEnabled);
      syncAudio(true);
    };

    // Toggle Button
    const btn = document.createElement('button');
    btn.id = 'meteor-toggle-btn';
    btn.className = 'float-btn';
    btn.type = 'button';
    btn.textContent = '🌟';
    btn.title = 'Meteor shower';

    btn.onclick = (e) => {
      isRunning = !isRunning;
      writeSetting(meteorAnimKey, isRunning);
      if (isRunning) {
        loop();
      }
      syncAudio(true);
    };

    row.append(soundBtn, btn);
    container.appendChild(row);
    if (isNewContainer) document.body.appendChild(container);
  }

  function updateSoundBtn() {
    soundBtn.hidden = !isRunning;
    const pending = soundEnabled && !audio.playing() && !document.hidden;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.classList.toggle('is-pending', pending);
    soundBtn.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
    soundBtn.title = !soundEnabled ? 'Meteor sound: off'
      : pending ? 'Meteor sound: on (starts when you click the page)'
      : 'Meteor sound: on';
    soundBtn.setAttribute('aria-label', soundBtn.title);
  }

  // Browsers only let audio start from a click or keypress. When the sound was left on, it starts on
  // the reader's first one (the meteor buttons handle their own clicks).
  const GESTURES = ['pointerup', 'keydown'];
  function onGesture(e) {
    if (e.target instanceof Element && e.target.closest('#meteor-btns')) return;
    syncAudio(true);
  }
  function listenForGesture(on) {
    for (const type of GESTURES) {
      if (on) document.addEventListener(type, onGesture, true);
      else document.removeEventListener(type, onGesture, true);
    }
  }

  // Plays the sound when it is on, the shower runs and the page is visible; otherwise silences it.
  function syncAudio(fromGesture) {
    const want = soundEnabled && isRunning && !document.hidden;
    if (!want) {
      listenForGesture(false);
      audio.stop();
    } else if (!fromGesture && !audio.unlocked()) {
      listenForGesture(true);
    } else {
      audio.start().then(() => {
        if (audio.playing()) listenForGesture(false);
        updateSoundBtn();
      });
    }
    updateSoundBtn();
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    if (!isRunning) {
      return;
    }
    animationFrameId = requestAnimationFrame(loop);
    if (meteorImageData === null) {
      return;
    }

    // Spawn new meteors
    if (meteors.length < CONFIG.meteorCount && Math.random() < 0.05) {
      meteors.push(new Meteor());
    }

    // Update & Draw Meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      let m = meteors[i];
      m.update();
      m.draw(ctx);
      if (m.dead) {
        meteors.splice(i, 1);
      }
    }

    // Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
