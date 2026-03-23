const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.logo-group \{\n  display: flex;\n  align-items: center;\n  gap: 1\.5rem;\n\}/g, '');

fs.writeFileSync('styles.css', css);
