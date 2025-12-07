/**
 * Meteor Shower Animation
 */

(function () {
  // Config
  const CONFIG = {
    meteorSpeed: 2, // Base speed
    meteorSize: 24, // Head size
    meteorCount: 10, // Max concurrent meteors
    meteorTailLength: 150,
    meteorTailWidth: 10,
    meteorHeadImageSrc: 'https://liveahero-wiki.github.io/cdn/Sprite/item_stone01.png',
    particleCount: 5,
    particleSize: 5,
    particleLife: 30, // Frames
  };

  const SHAPES = [
    [{x: -1, y: -1}, {x: -1, y: 0}, {x: 1, y: 1}],
    [{x: -1, y: 1}, {x: 0.5, y: 0.5}, {x: 1, y: -1}, {x: -0.5, y: 0}],
    [{x: 0, y: -1}, {x: 1, y: -1}, {x: -0.5, y: 0.5}],
    [{x: -1, y: 0}, {x: -0.5, y: 1}, {x: 0.5, y: 1}, {x: 1, y: 0}],
    [{x: 0, y: 1}, {x: 0.75, y: 0.5}, {x: 0, y: -1}],
  ]

  // Assets
  const meteorImage = new Image();
  meteorImage.src = CONFIG.meteorHeadImageSrc;

  const meteorAnimKey = "meteor";
  function getUserSetting() {
    const setting = localStorage.getItem(meteorAnimKey);
    if (setting === null) return true;
    return setting == "true";
  }

  // State
  let isRunning = getUserSetting();
  let meteors = [];
  let particles = [];
  let canvas, ctx;
  let width, height;
  let animationFrameId;

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
      this.lightness = 1.0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

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
      ctx.drawImage(meteorImage, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }

    explode() {
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

      this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
    }

    draw(ctx) {
      const alpha = this.life / this.maxLife;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      
      ctx.moveTo(...this.move(this.shape[0], CONFIG.particleSize));
      for (let i = 1; i < this.shape.length; i++) {
        ctx.lineTo(...this.move(this.shape[i], CONFIG.particleSize));
      }
      ctx.closePath();

      ctx.fill();
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

    // Start Loop
    loop();
  }

  function createControls() {
    // Inject Styles for Anchor Positioning
    const style = document.createElement('style');
    style.textContent = `
      #meteor-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: sans-serif;
      }
      #meteor-shower-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999;
        pointer-events: none;
      }
      #meteor-toggle-btn {
        anchor-name: --meteor-toggle-btn;
        font-size: 24px;
        background: #333;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
      }
      #meteor-toggle-btn:hover {
        background-color: #555;
      }
      #meteor-shower-menu {
        margin: 0; /* Override default popover margin */
        position-anchor: --meteor-toggle-btn;
        bottom: anchor(top);
        right: anchor(right);
        margin-bottom: 10px; /* Spacing */
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.id = 'meteor-container';

    // Toggle Button
    const btn = document.createElement('button');
    btn.id = 'meteor-toggle-btn';
    btn.textContent = '☄️';

    btn.onclick = (e) => {
      isRunning = !isRunning;
      localStorage.setItem(meteorAnimKey, isRunning ? "true" : "false");
      if (isRunning) {
        loop();
      }
    };

    container.appendChild(btn);
    document.body.appendChild(container);
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
