const fs = require('fs');
const src = "C:\\Users\\navya shree g n\\.gemini\\antigravity-ide\\brain\\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\\media__1785573027866.jpg";
const dst = "e:\\MGV Painters\\director.jpg";
try {
    fs.copyFileSync(src, dst);
    console.log("SUCCESS: Copied new director photo to e:\\MGV Painters\\director.jpg");
} catch (err) {
    console.error("ERROR:", err.message);
}
