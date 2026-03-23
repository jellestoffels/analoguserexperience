document.addEventListener('DOMContentLoaded', () => {
  // Par64 Tungsten Light Simulator & Stateful Interactions
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
  let isHoveringBlock = false;
  
  // State persistence across pages
  let hasInteracted = sessionStorage.getItem('analogInteracted') === 'true';
  let heat = 0; // Represents the tungsten glow (0.0 to 1.0)
  
  let savedHeat = parseFloat(sessionStorage.getItem('analogHeat'));
  let savedTime = parseInt(sessionStorage.getItem('analogTime'));
  if (!isNaN(savedHeat) && !isNaN(savedTime) && savedHeat > 0) {
    let elapsedMs = Date.now() - savedTime;
    let heatLoss = (elapsedMs / 16) * 0.0035; // simulate frame drop decay
    heat = Math.max(0, savedHeat - heatLoss);
    
    let savedX = parseFloat(sessionStorage.getItem('analogX'));
    let savedY = parseFloat(sessionStorage.getItem('analogY'));
    if (!isNaN(savedX) && !isNaN(savedY)) {
      mouse.x = savedX;
      mouse.y = savedY;
    }
  }

  // Restore selector state if present
  const fixtureSelector = document.getElementById('fixture-selector');
  if (fixtureSelector) {
    const savedFixture = sessionStorage.getItem('analogFixture');
    if (savedFixture) {
      fixtureSelector.value = savedFixture;
    }
    fixtureSelector.addEventListener('mousedown', (e) => e.stopPropagation());
    fixtureSelector.addEventListener('change', () => {
      sessionStorage.setItem('analogFixture', fixtureSelector.value);
    });
  }

  // Save state on navigation
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('analogInteracted', hasInteracted.toString());
    sessionStorage.setItem('analogHeat', heat.toString());
    sessionStorage.setItem('analogX', mouse.x.toString());
    sessionStorage.setItem('analogY', mouse.y.toString());
    sessionStorage.setItem('analogTime', Date.now().toString());
    if (fixtureSelector) {
      sessionStorage.setItem('analogFixture', fixtureSelector.value);
    }
  });

  // Track interactions
  const markInteraction = () => { hasInteracted = true; };

  window.addEventListener('mousedown', (e) => { 
    isDown = true; 
    markInteraction();
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
  });
  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', (e) => { 
    if (isDown || isHoveringBlock) {
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    }
  });

  // Touch support
  window.addEventListener('touchstart', (e) => { 
    isDown = true; 
    markInteraction();
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
  }, {passive: true});
  window.addEventListener('touchend', () => { isDown = false; });
  window.addEventListener('touchmove', (e) => { 
    if (isDown || isHoveringBlock) {
      mouse.x = e.touches[0].clientX; 
      mouse.y = e.touches[0].clientY; 
    }
  }, {passive: true});

  // Block Hover bindings
  document.querySelectorAll('a, button, .manga-tile').forEach(el => {
    el.addEventListener('click', () => { 
      heat = 1.0; 
      markInteraction(); 
    });
    el.addEventListener('mouseenter', () => { 
      isHoveringBlock = true; 
      markInteraction(); 
    });
    el.addEventListener('mouseleave', () => { 
      isHoveringBlock = false; 
    });
  });

  // Tungsten color decay profile
  function mixColor(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t),
      a: c1.a + (c2.a - c1.a) * t
    };
  }

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

  let currentRadiusMultiplier = 0.4;

  // Main render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    let currentTargetRadiusMultiplier = 0.4;

    // Heat and Radius Physics 
    if (!hasInteracted) {
      let time = Date.now() * 0.002;
      mouse.x = width / 2 + Math.sin(time * 0.7) * (width * 0.15);
      mouse.y = height / 2 + Math.cos(time * 0.5) * (height * 0.15);
      heat = 0.25 + Math.sin(time * 1.5) * 0.1; 
      currentTargetRadiusMultiplier = 0.2;
    } else {
      if (isDown) {
        heat += 0.04;
        if (heat > 1) heat = 1;
        currentTargetRadiusMultiplier = 0.4 + (heat * 0.4);
      } else if (isHoveringBlock) {
        if (heat < 0.5) heat += 0.02;     
        else if (heat > 0.5) heat -= 0.0035; 
        currentTargetRadiusMultiplier = 0.18; 
      } else {
        heat -= 0.0035; 
        if (heat < 0) heat = 0;
        currentTargetRadiusMultiplier = 0.4 + (heat * 0.4);
      }
    }

    currentRadiusMultiplier += (currentTargetRadiusMultiplier - currentRadiusMultiplier) * 0.1;

    if (heat > 0) {
      const core = getColor(heat);
      
      const activeFixture = sessionStorage.getItem('analogFixture') || 'par64';
      let bulbs = [];
      let baseR = Math.max(width, height) * currentRadiusMultiplier;
      let spacing = baseR * 0.25;

      if (activeFixture === '2-cell') {
        bulbs.push({dx: -spacing/2, dy: 0, r: baseR * 0.7});
        bulbs.push({dx: spacing/2, dy: 0, r: baseR * 0.7});
      } else if (activeFixture === '4-cell') {
        bulbs.push({dx: -spacing/2, dy: -spacing/2, r: baseR * 0.6});
        bulbs.push({dx: spacing/2, dy: -spacing/2, r: baseR * 0.6});
        bulbs.push({dx: -spacing/2, dy: spacing/2, r: baseR * 0.6});
        bulbs.push({dx: spacing/2, dy: spacing/2, r: baseR * 0.6});
      } else if (activeFixture === 'fourbar') {
        let s = spacing * 1.5;
        bulbs.push({dx: -s*1.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: -s*0.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: s*0.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: s*1.5, dy: 0, r: baseR * 0.75});
      } else if (activeFixture === 'svoboda') {
        let s = spacing * 0.8;
        for(let i=0; i<9; i++) {
          bulbs.push({dx: (i - 4) * s, dy: 0, r: baseR * 0.5});
        }
      } else { // 'par64'
        bulbs.push({dx: 0, dy: 0, r: baseR});
      }

      ctx.globalCompositeOperation = 'screen';
      
      bulbs.forEach(b => {
        const innerRadius = b.r * 0.05;
        const grad = ctx.createRadialGradient(mouse.x + b.dx, mouse.y + b.dy, innerRadius, mouse.x + b.dx, mouse.y + b.dy, b.r);
        
        grad.addColorStop(0, `rgba(${core.r}, ${core.g}, ${core.b}, ${core.a})`);
        grad.addColorStop(0.3, `rgba(${Math.floor(core.r)}, ${Math.floor(core.g * 0.6)}, ${Math.floor(core.b * 0.3)}, ${core.a * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height); 
      });
    }

    requestAnimationFrame(render);
  }
  
  render();
});
