const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, 'public');

// Set headers to enforce security policies
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files
app.use(express.static(STATIC_DIR));

// Handle all other routes to return index.html (for single-page applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

