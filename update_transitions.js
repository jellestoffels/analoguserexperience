const fs = require('fs');
let code = fs.readFileSync('scripts.js', 'utf8');

code = code.replace(
  `  // Block Hover bindings
  document.querySelectorAll('a, button, .manga-tile').forEach(el => {
    el.addEventListener('click', () => { 
      heat = 1.0; 
      markInteraction(); 
    });
    el.addEventListener('mouseenter', () => { `,
  `  // Block Hover bindings
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
    el.addEventListener('mouseenter', () => { `
);

// Carousel Lightbox Logic
code += `
// -------------
// Project Image Lightbox Carousel
// -------------
const lightboxOverlay = document.createElement('div');
lightboxOverlay.id = 'lightbox-overlay';
lightboxOverlay.innerHTML = \`
  <div class="lightbox-close">✕</div>
  <div class="lightbox-prev">←</div>
  <img src="" class="lightbox-img" />
  <div class="lightbox-next">→</div>
\`;
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
`;

fs.writeFileSync('scripts.js', code);
