const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8889;
const publicDir = __dirname;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  
  if (urlPath === '/copy-logo') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785592532437.jpg";
    const dst = path.join(publicDir, 'logo.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Logo copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying logo: ' + err.message);
    }
    return;
  }


  if (urlPath === '/copy-interior') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785648396601.jpg";
    const dst = path.join(publicDir, 'interior.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Interior wallpaper copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying interior wallpaper: ' + err.message);
    }
    return;
  }

  if (urlPath === '/copy-exterior') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785649454535.jpg";
    const dst = path.join(publicDir, 'exterior.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Exterior wallpaper copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying exterior wallpaper: ' + err.message);
    }
    return;
  }

  if (urlPath === '/copy-gate') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785655937113.jpg";
    const dst = path.join(publicDir, 'gate.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Gate wallpaper copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying gate wallpaper: ' + err.message);
    }
    return;
  }

  if (urlPath === '/copy-wood') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785665982521.jpg";
    const dst = path.join(publicDir, 'wood.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Wood wallpaper copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying wood wallpaper: ' + err.message);
    }
    return;
  }

  if (urlPath === '/copy-logo-new2') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785673303763.jpg";
    const dst1 = path.join(publicDir, 'logo.jpg');
    const dst2 = path.join(publicDir, 'logo.svg.jpeg');
    try {
      fs.copyFileSync(src, dst1);
      fs.copyFileSync(src, dst2);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Logo copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying logo: ' + err.message);
    }
    return;
  }

  if (urlPath === '/copy-wallpapers') {
    const files = [
      { src: "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\waterproofing_bg_1785687623951.png", dst: 'waterproofing.jpg' },
      { src: "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\acidwash_bg_1785687646599.png", dst: 'acidwash.jpg' },
      { src: "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\grouting_bg_1785687666891.png", dst: 'grouting.jpg' },
      { src: "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\wood_polish_bg_1785687685368.png", dst: 'wood.jpg' },
      { src: "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785655937113.jpg", dst: 'gate.jpg' }
    ];
    let errors = [];
    files.forEach(f => {
      try {
        fs.copyFileSync(f.src, path.join(publicDir, f.dst));
      } catch (err) {
        errors.push(f.dst + ': ' + err.message);
      }
    });
    if (errors.length > 0) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Errors copying wallpapers:\n' + errors.join('\n'));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('All wallpapers copied successfully!');
    }
    return;
  }






  if (urlPath === '/copy-director') {
    const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785573027866.jpg";
    const dst = path.join(publicDir, 'director.jpg');
    try {
      fs.copyFileSync(src, dst);
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Director photo copied successfully!');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error copying director photo: ' + err.message);
    }
    return;
  }

  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  const decodedUrl = decodeURIComponent(urlPath);
  const filePath = path.join(publicDir, decodedUrl);
  
  // Basic security check to prevent directory traversal
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
