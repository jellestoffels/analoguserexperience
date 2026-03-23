const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const logoHtml = `<a href="index.html" class="nav-logo"><img src="/resources/images/logo.png" alt="logo" style="filter: brightness(0.70);"></a>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Strip global logo
  content = content.replace(/<a href="index\.html" class="global-logo">[\s\S]*?<\/a>\s+/g, '');
  
  // Also strip if on single line
  content = content.replace(/<a href="index\.html" class="global-logo">.*?<\/a>/g, '');

  if (f === 'index.html') {
    // Inject logo inside logo-group before h1
    if (!content.includes('class="nav-logo"')) {
      content = content.replace(/<h1 class="logo-text">/, logoHtml + '\n          <h1 class="logo-text">');
    }
  } else if (f === 'vj.html') {
    // vj.html doesn't have h1, add before the select
    if (!content.includes('class="nav-logo"')) {
       content = content.replace(/<a href="index\.html" class="back"([^>]*)>([^<]*)<\/a>/, 
         `<div class="logo-group" style="margin-bottom: 2rem;">\n          ${logoHtml}\n          <a href="index.html" class="back"$1>$2</a>\n        </div>`);
       // We also need to remove the inline back button margin to preserve space
       content = content.replace(/style="margin-bottom: 2rem; display: inline-block;"/, '');
    }
  } else {
    // Other pages: wrap h1 in logo-group
    if (!content.includes('class="nav-logo"')) {
      content = content.replace(/(<h1 class="page-title"[^>]*>.*?<\/h1>)/, 
        `<div class="logo-group">\n          ${logoHtml}\n          $1\n        </div>`);
    }
  }

  // Set favicons to root if they are .ico (or maybe I'll move them)
  content = content.replace(/href="\/resources\/favicon\/favicon\.ico"/g, 'href="/favicon.ico"');

  fs.writeFileSync(f, content);
});

console.log("HTML fixed.");
