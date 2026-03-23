const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const favicons = `
    <link rel=\"icon\" type=\"image/png\" href=\"resources/favicon/favicon-96x96.png\" sizes=\"96x96\" />
    <link rel=\"icon\" type=\"image/svg+xml\" href=\"resources/favicon/favicon.svg\" />
    <link rel=\"shortcut icon\" href=\"resources/favicon/favicon.ico\" />
    <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"resources/favicon/apple-touch-icon.png\" />
    <meta name=\"apple-mobile-web-app-title\" content=\"analoguserexperience\" />
    <link rel=\"manifest\" href=\"resources/favicon/site.webmanifest\" />`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
    content = content.replace('</head>', `${favicons}\n  </head>`);
    fs.writeFileSync(f, content);
  }
});

