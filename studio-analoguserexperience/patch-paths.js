// Post-build script: rewrites asset paths in studio/index.html from
// root-relative (/static/, /vendor/) to /studio/-prefixed paths.
// Run automatically after: npm run build (via "postbuild" hook)

const fs = require('fs')
const path = require('path')

const indexPath = path.resolve(__dirname, '../studio/index.html')

if (!fs.existsSync(indexPath)) {
  console.error('studio/index.html not found – run "npm run build" first')
  process.exit(1)
}

let html = fs.readFileSync(indexPath, 'utf8')

// Replace root-absolute asset references with /studio/-prefixed ones.
html = html
  .replace(/="\/static\//g, '="/studio/static/')
  .replace(/="\/vendor\//g, '="/studio/vendor/')

fs.writeFileSync(indexPath, html, 'utf8')
console.log('✔ Patched studio/index.html asset paths → /studio/static/ and /studio/vendor/')
