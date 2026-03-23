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
    el.addEventListener('click', (e) => { 
      heat = 1.0; 
      markInteraction(); 
      
      const href = el.getAttribute('href');
      // Apply the expanding transition if it's a manga-tile navigating to a new page
      if (el.classList.contains('manga-tile') && href && href !== '#') {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true);
        document.body.appendChild(clone);
        
        // Remove hover effects on clone
        clone.style.pointerEvents = 'none';
        
        // Position exactly over the original
        clone.style.position = 'fixed';
        clone.style.top = rect.top + 'px';
        clone.style.left = rect.left + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.zIndex = '999999';
        clone.style.margin = '0';
        clone.style.transition = 'all 0.5s cubic-bezier(0.8, 0, 0.2, 1)';
        
        // Force reflow
        clone.getBoundingClientRect();
        
        // Expand to fill screen
        clone.style.top = '0px';
        clone.style.left = '0px';
        clone.style.width = '100vw';
        clone.style.height = '100vh';
        
        setTimeout(() => {
          window.location.href = href;
        }, 450);
      }
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
  let targetRadius = 0.4;

  // Main render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    let currentTargetRadiusMultiplier = targetRadius;

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
        targetRadius = 0.4 + (heat * 0.4);
        currentTargetRadiusMultiplier = targetRadius;
      } else if (isHoveringBlock) {
        if (heat < 0.5) heat += 0.008;     
        else if (heat > 0.5) heat -= 0.0035; 
        targetRadius = 0.22; 
        currentTargetRadiusMultiplier = targetRadius;
      } else {
        heat -= 0.0035; 
        if (heat < 0) heat = 0;
        currentTargetRadiusMultiplier = targetRadius;
      }
    }

    currentRadiusMultiplier += (currentTargetRadiusMultiplier - currentRadiusMultiplier) * 0.1;

    if (heat > 0) {
      const core = getColor(heat);
      
      const activeFixture = sessionStorage.getItem('analogFixture') || 'par64';
      let bulbs = [];
      let baseR = Math.max(width, height) * currentRadiusMultiplier;
      let spacing = baseR * 0.25;
      let spacingscale = 1.3;

      if (activeFixture === '2-cell') {
        bulbs.push({dx: -spacing/spacingscale, dy: 0, r: baseR * 0.45});
        bulbs.push({dx: spacing/spacingscale, dy: 0, r: baseR * 0.45});
      } else if (activeFixture === '4-cell') {
        bulbs.push({dx: -spacing/spacingscale, dy: -spacing/1.5, r: baseR * 0.45});
        bulbs.push({dx: spacing/spacingscale, dy: -spacing/1.5, r: baseR * 0.45});
        bulbs.push({dx: -spacing/spacingscale, dy: spacing/1.5, r: baseR * 0.45});
        bulbs.push({dx: spacing/spacingscale, dy: spacing/1.5, r: baseR * 0.45});
      } else if (activeFixture === 'fourbar') {
        let s = spacing * 1.5
        bulbs.push({dx: -s*1.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: -s*0.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: s*0.5, dy: 0, r: baseR * 0.75});
        bulbs.push({dx: s*1.5, dy: 0, r: baseR * 0.75});
      } else if (activeFixture === 'svoboda') {
        let s = spacing * 0.7; // Compact horizontal spacing
        let r = baseR * 0.35; // Less wide spread
        let rowSpacing = s * 0.866; // Roughly hex grid vertically
        
        // 4 on top
        bulbs.push({dx: -s*1.5, dy: -rowSpacing/2, r: r, isSvoboda: true});
        bulbs.push({dx: -s*0.5, dy: -rowSpacing/2, r: r, isSvoboda: true});
        bulbs.push({dx: s*0.5, dy: -rowSpacing/2, r: r, isSvoboda: true});
        bulbs.push({dx: s*1.5, dy: -rowSpacing/2, r: r, isSvoboda: true});
        // 3 on bottom
        bulbs.push({dx: -s, dy: rowSpacing/2, r: r, isSvoboda: true});
        bulbs.push({dx: 0, dy: rowSpacing/2, r: r, isSvoboda: true});
        bulbs.push({dx: s, dy: rowSpacing/2, r: r, isSvoboda: true});
      } else { // 'par64'
        bulbs.push({dx: 0, dy: 0, r: baseR});
      }

      ctx.globalCompositeOperation = 'screen';
      
      bulbs.forEach(b => {
        const innerRadius = b.r * 0.05;
        const grad = ctx.createRadialGradient(mouse.x + b.dx, mouse.y + b.dy, innerRadius, mouse.x + b.dx, mouse.y + b.dy, b.r);
        
        if (b.isSvoboda) {
          grad.addColorStop(0, `rgba(0, 0, 0, ${core.a})`); // Blocked center
          grad.addColorStop(0.15, `rgba(${core.r}, ${core.g}, ${core.b}, ${core.a})`); // Inner rim
          grad.addColorStop(0.3, `rgba(${Math.floor(core.r)}, ${Math.floor(core.g * 0.6)}, ${Math.floor(core.b * 0.3)}, ${core.a * 0.6})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, `rgba(${core.r}, ${core.g}, ${core.b}, ${core.a})`);
          grad.addColorStop(0.3, `rgba(${Math.floor(core.r)}, ${Math.floor(core.g * 0.6)}, ${Math.floor(core.b * 0.3)}, ${core.a * 0.6})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height); 
      });
    }

    requestAnimationFrame(render);
  }
  
  render();
});

// -------------
// Project Image Lightbox Carousel
const lightboxOverlay = document.createElement('div');
lightboxOverlay.id = 'lightbox-overlay';
lightboxOverlay.innerHTML = `
  <div class="lightbox-close">✕</div>
  <div class="lightbox-prev">←</div>
  <img src="" class="lightbox-img" />
  <div class="lightbox-next">→</div>
`;
document.body.appendChild(lightboxOverlay);

let carouselImages = [];
let carouselIndex = 0;

document.addEventListener('click', (e) => {
  let imgBox = e.target.closest('.interlock-item');
  if (imgBox) {
    let img = imgBox.querySelector('img');
    if (img) {
      const grid = imgBox.closest('.interlock-grid');
      if (grid) {
        carouselImages = Array.from(grid.querySelectorAll('img')).map(i => i.src);
        carouselIndex = carouselImages.indexOf(img.src);
        
        lightboxOverlay.querySelector('img').src = carouselImages[carouselIndex];
        lightboxOverlay.style.display = 'flex';
        lightboxOverlay.getBoundingClientRect(); // reflow
        lightboxOverlay.style.opacity = '1';
      }
    }
  }
});

lightboxOverlay.addEventListener('click', (e) => {
  if (e.target.classList.contains('lightbox-close') || e.target === lightboxOverlay) {
    lightboxOverlay.style.opacity = '0';
    setTimeout(() => { lightboxOverlay.style.display = 'none'; }, 300);
  } else if (e.target.classList.contains('lightbox-prev')) {
    carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
    lightboxOverlay.querySelector('img').src = carouselImages[carouselIndex];
  } else if (e.target.classList.contains('lightbox-next')) {
    carouselIndex = (carouselIndex + 1) % carouselImages.length;
    lightboxOverlay.querySelector('img').src = carouselImages[carouselIndex];
  }
});

document.addEventListener('keydown', (e) => {
  if (lightboxOverlay.style.display === 'flex') {
    if (e.key === 'ArrowLeft') {
      carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
      lightboxOverlay.querySelector('img').src = carouselImages[carouselIndex];
    } else if (e.key === 'ArrowRight') {
      carouselIndex = (carouselIndex + 1) % carouselImages.length;
      lightboxOverlay.querySelector('img').src = carouselImages[carouselIndex];
    } else if (e.key === 'Escape') {
      lightboxOverlay.style.opacity = '0';
      setTimeout(() => { lightboxOverlay.style.display = 'none'; }, 300);
    }
  }
});

