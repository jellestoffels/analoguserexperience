const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Fix favicon.ico just in case the rel is picky
  content = content.replace(/<link rel="shortcut icon".*?>/, '<link rel="icon" href="/resources/favicon/favicon.ico" />');

  // Add the explicit global fixed logo that links to the homepage, if not already there
  const globalLogo = `<a href="index.html" class="global-logo"><img src="resources/images/logo.png" alt="logo" onerror="this.style.display='none'"></a>`;
  
  if (!content.includes('class="global-logo"')) {
    content = content.replace('<main class="site-shell">', '<main class="site-shell">\n      ' + globalLogo);
    content = content.replace('<main class="site-shell" style="padding: 0; display: block;">', '<main class="site-shell" style="padding: 0; display: block;">\n      ' + globalLogo);
  }

  // Remove the old inline logo-img from index.html if we add a global one
  if (f === 'index.html') {
    content = content.replace(/<img src="resources\/images\/logo.png".*? alt="logo" onerror="this\.style\.display='none'">/, '');
  }

  fs.writeFileSync(f, content);
});

console.log("Done");
