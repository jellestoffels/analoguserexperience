document.addEventListener('DOMContentLoaded', () => {
  // Par64 Tungsten Light Simulator
  const canvas = document.createElement('canvas');
  canvas.id = 'interactive-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const ctx = canvas.getContext('2d');
  let width, height;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  let mouse = { x: width / 2, y: height / 2 };
  let isDown = false;
  let heat = 0; // Represents the tungsten glow (0.0 to 1.0)

  // Track interactions
  window.addEventListener('mousedown', (e) => { 
    isDown = true; 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
  });
  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', (e) => { 
    if (isDown) {
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    }
  });

  // Touch support for dragging the light
  window.addEventListener('touchstart', (e) => { 
    isDown = true; 
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
  }, {passive: true});
  window.addEventListener('touchend', () => { isDown = false; });
  window.addEventListener('touchmove', (e) => { 
    if (isDown) {
      mouse.x = e.touches[0].clientX; 
      mouse.y = e.touches[0].clientY; 
    }
  }, {passive: true});

  // Tungsten color decay profile
  function mixColor(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t),
      a: c1.a + (c2.a - c1.a) * t
    };
  }

  // 5 milestones of a tungsten filament cooling down
  const colors = [
    { r: 0,   g: 0,   b: 0,   a: 0 },       // 0: Off / Darkness
    { r: 60,  g: 10,  b: 0,   a: 0.15 },    // 1: Very dim red residual glow
    { r: 230, g: 60,  b: 10,  a: 0.5 },     // 2: Deep analog orange
    { r: 255, g: 170, b: 50,  a: 0.8 },     // 3: Warm yellow-orange wash
    { r: 255, g: 250, b: 240, a: 1.0 }      // 4: Blinding hot warm-white
  ];

  function getColor(h) {
    if (h <= 0) return colors[0];
    if (h >= 1) return colors[4];
    let scaled = h * 4;
    let index = Math.floor(scaled);
    let t = scaled - index;
    return mixColor(colors[index], colors[index+1], t);
  }

  // Main render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Physics for tungsten heat string
    if (isDown) {
      heat += 0.04;      // Power on: reaches max brightness in ~0.4s
      if (heat > 1) heat = 1;
    } else {
      heat -= 0.0035;    // Power off: long residual fade for ~4.5 seconds
      if (heat < 0) heat = 0;
    }

    if (heat > 0) {
      // Calculate active color from the profile
      const core = getColor(heat);
      
      // Calculate beam spread mapping (intensity widens the beam)
      // Base radius is relatively large to illuminate the "page"
      const radius = Math.max(width, height) * (0.4 + (heat * 0.4));
      const midRadius = radius * 0.4;
      const innerRadius = radius * 0.05;

      const grad = ctx.createRadialGradient(mouse.x, mouse.y, innerRadius, mouse.x, mouse.y, radius);
      
      // Core hot spot
      grad.addColorStop(0, `rgba(${core.r}, ${core.g}, ${core.b}, ${core.a})`);
      // Mid-field wash (drops opacity and favors red/orange naturally)
      grad.addColorStop(0.3, `rgba(${Math.floor(core.r)}, ${Math.floor(core.g * 0.6)}, ${Math.floor(core.b * 0.3)}, ${core.a * 0.6})`);
      // Outer light falloff fading into the void
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Screen blend pushes the light over the dark grinds heavily
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    requestAnimationFrame(render);
  }
  
  render();
});
