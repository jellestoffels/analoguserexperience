const fs = require('fs');
let code = fs.readFileSync('scripts.js', 'utf8');

const marker = '// -------------';
const parts = code.split(marker);

// Keep the first part (original code) + one instance of the lightbox
fs.writeFileSync('scripts.js', parts[0] + marker + parts[1]);
