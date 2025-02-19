import express from 'express';
import path from 'path';
import { createServer } from 'http';

const app = express();
const port = 8080;
const rootDir = process.cwd(); // Use process.cwd()
const staticPath = path.join(rootDir, 'dist', 'assets'); // dist/assets relative to root
const indexPath = path.join(rootDir, 'dist', 'index.html'); // dist/index.html relative to root

// Serve static files from Vite build
app.use(express.static(staticPath));

// Handle SPA fallback
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

console.log('Static path:', staticPath);
console.log('Index path:', indexPath);

createServer(app).listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
}); 