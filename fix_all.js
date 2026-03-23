const fs = require('fs');

// Fix styles.css
let css = fs.readFileSync('styles.css', 'utf8');

// 1. Mobile blocks grid: change grid-template-columns: 1fr; to grid-template-columns: repeat(2, 1fr);
css = css.replace(/@media \(max-width: 500px\)\s*\{\s*\.manga-grid\s*\{\s*grid-template-columns:\s*1fr;\s*\}\s*\}/, 
`@media (max-width: 500px) {
  .manga-grid { grid-template-columns: repeat(2, 1fr); }
}`);

// 2. Title smaller and place at same height as logo. Decrease brightness of logo.
// Add logo-group flex layout and style the logo img.
const logoGroupCss = `
.logo-group {
  display: flex;
  align-items: center;
  gap: 1.5vw;
}

.nav-logo, .nav-logo img {
  display: block;
}

.nav-logo img {
  height: clamp(1.5rem, 5vw, 2.5rem);
  width: auto;
  object-fit: contain;
  filter: brightness(0.65) !important;
}

`;
// Ensure it's not added twice
if (!css.includes('.logo-group {')) {
    css += '\n' + logoGroupCss;
}

// Fix logo-text font-size
css = css.replace(
  /\.logo-text\s*\{[^}]*font-size:\s*clamp\([^)]*\);/g,
  (match) => match.replace(/font-size:\s*clamp\([^)]*\);/, 'font-size: clamp(1.5rem, 5vw, 2.5rem);')
);

// 3. Images in grayscale and in color when hovering
// Update placeholder-img and hover
css = css.replace(
  /\.placeholder-img\s*\{[\s\S]*?opacity:\s*0\s*;[\s\S]*?\}/,
  (m) => m.replace('opacity: 0;', 'opacity: 0.5;').replace('filter: grayscale(100%) contrast(300%) brightness(0.6);', 'filter: grayscale(100%) contrast(120%) brightness(0.6);')
);

css = css.replace(
  /\.manga-tile:hover\s*\.placeholder-img\s*\{[\s\S]*?\}/,
  (m) => m.replace('opacity: 0.4;', 'opacity: 1;').replace('filter: grayscale(100%) contrast(150%) brightness(1);', 'filter: grayscale(0%) contrast(100%) brightness(1);')
);

fs.writeFileSync('styles.css', css, 'utf8');

// Fix scripts.js
let js = fs.readFileSync('scripts.js', 'utf8');

// 1. Warm trails - change clearRect to alphablended fillRect
js = js.replace(
  /ctx\.clearRect\(0,\s*0,\s*width,\s*height\);/,
  `ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);`
);

// 2. Box edges fade away during expand animation
js = js.replace(
  /clone\.style\.height = '100vh';\s+setTimeout/g,
  `clone.style.height = '100vh';
        clone.style.borderColor = 'transparent';
        
        setTimeout`
);

fs.writeFileSync('scripts.js', js, 'utf8');

console.log('Done fixing css and js.');
