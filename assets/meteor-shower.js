/**
 * Meteor Shower Animation
 * 
 * Requirement:
 * - Fullscreen canvas
 * - Meteor shower animation (start/stop)
 * - Menu button with Popover API
 * - Meteors break into particles on edge collision
 * - No third party libraries
 */

(function () {
  // Config
  const CONFIG = {
    meteorSpeed: 2, // Base speed
    meteorSize: 24, // Head size
    meteorCount: 10, // Max concurrent meteors
    meteorTailLength: 150,
    meteorTailColor: 'rgba(255, 255, 255, 0.2)',
    meteorHeadImageSrc: 'https://liveahero-wiki.github.io/cdn/Sprite/item_stone01.png',
    particleCount: 5,
    particleLife: 30, // Frames
  };

  // Assets
  const meteorImage = new Image();
  meteorImage.src = CONFIG.meteorHeadImageSrc;

  // State
  let isRunning = true;
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
      ctx.lineWidth = 2;
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
      ctx.rotate(Math.atan2(this.vy, this.vx) - Math.PI / 4); // Adjust for image orientation?
      // Assuming image is round-ish or we just draw it centered.
      // If the stone image needs rotation, adjust here.
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
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Initialization
  function init() {
    // Create Canvas
    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Background
    canvas.style.pointerEvents = 'none'; // Let clicks pass through
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');

    // Create UI
    createControls();

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
            #meteor-toggle-btn {
                anchor-name: --meteor-toggle-btn;
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
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'sans-serif';

    // Toggle Button
    const btn = document.createElement('button');
    btn.id = 'meteor-toggle-btn'; // ID for styling
    btn.textContent = '☄️';
    btn.style.fontSize = '24px';
    btn.style.background = '#333';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.cursor = 'pointer';

    // Popover Menu
    const menu = document.createElement('div');
    menu.popover = 'auto';
    menu.id = 'meteor-shower-menu';
    menu.style.padding = '1rem';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '8px';
    menu.style.background = '#fff';
    menu.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

    // Use popovertarget for automatic toggling
    btn.setAttribute('popovertarget', 'meteor-shower-menu');

    const title = document.createElement('h4');
    title.textContent = 'Meteor Control';
    title.style.margin = '0 0 10px 0';

    const toggleLabel = document.createElement('label');
    toggleLabel.style.display = 'flex';
    toggleLabel.style.alignItems = 'center';
    toggleLabel.style.gap = '8px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isRunning;
    checkbox.onchange = (e) => {
      isRunning = e.target.checked;
    };

    toggleLabel.appendChild(checkbox);
    toggleLabel.appendChild(document.createTextNode('Animation Active'));

    menu.appendChild(title);
    menu.appendChild(toggleLabel);

    container.appendChild(btn);
    // Container appends button, but Menu (popover) should be appended to body or somewhere 
    // that allows it to break out? Actually top layer elements can be anywhere, 
    // but for anchor positioning to work comfortably, they just need to see the anchor.
    // Let's append menu to container or body. Body is safer for flow.
    document.body.appendChild(menu);
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
    animationFrameId = requestAnimationFrame(loop);

    ctx.clearRect(0, 0, width, height);

    if (isRunning) {
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
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
