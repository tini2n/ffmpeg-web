const express = require('express');
const path = require('path');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, 'public');

app.use((req, res, next) => {
    // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// app.use(
//     '/dist',
//     createProxyMiddleware({
//         target: 'http://localhost:3001',
//         changeOrigin: true,
//     }),
// );

app.use(express.static(STATIC_DIR));

// app.get('*.js', (req, res, next) => {
//     res.type('application/javascript');
//     next();
// });

app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
