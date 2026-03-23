const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Strip out global-logo stuff
css = css.replace(/\.global-logo[\s\S]*?\}\s*}/g, '');
css = css.replace(/\.global-logo \{[\s\S]*?\}/g, '');

// Clean out the manual offset we added to header-wrapper
css = css.replace(/\.header-wrapper, \.page-header \{[\s\S]*?\}/g, '');
css = css.replace(/\.vj-wrapper \{[\s\S]*?\}!important/g, '');

const newCSS = `

.logo-group {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  flex-wrap: wrap;
}

.nav-logo img {
  height: clamp(3rem, 10vw, 6rem);
  width: auto;
  object-fit: contain;
  display: block;
}
`;

fs.writeFileSync('styles.css', css + newCSS);
console.log("CSS updated.");
