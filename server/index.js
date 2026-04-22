import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// The port for our Express server
const PORT = process.env.PORT || 3000;
const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60;
const imageCache = new Map();

// Serve the static frontend files if they exist in dist/
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.PUPPETEER_CHROME_PATH;
const PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.cache', 'puppeteer');
const CHROME_PATH_FILE = path.join(PUPPETEER_CACHE_DIR, 'chrome-path.txt');

function getBuiltChromePath() {
  try {
    const value = fs.readFileSync(CHROME_PATH_FILE, 'utf8').trim();
    return value || null;
  } catch {
    return null;
  }
}

function getPublicBaseUrl(req) {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

app.get('/api/status', async (req, res) => {
  const { repo, period, count } = req.query;

  if (!repo) {
    return res.status(400).send('Missing repo parameter. Provide ?repo=owner/repo');
  }

  const cacheKey = `${repo}|${period || ''}|${count || ''}`;
  const cached = imageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(cached.buffer);
  }

  try {
    console.log(`Generating screenshot for ${repo}...`);
    // Launch headless browser
    const builtChromePath = getBuiltChromePath();
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: CHROME_PATH || builtChromePath || undefined,
      protocolTimeout: 120000,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a good default viewport size for the embed
    await page.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 1 });
    
    // Navigate to the frontend with embed mode
    const frontendUrl = getPublicBaseUrl(req);
    let targetUrl = `${frontendUrl}/?repo=${repo}&mode=embed`;
    if (period) targetUrl += `&period=${period}`;
    if (count) targetUrl += `&count=${count}`;
    console.log(`Navigating to ${targetUrl}...`);
    
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the repo content container to appear and no longer be loading
    await page.waitForSelector('#repo-content', { timeout: 10000 });
    
    // Wait for the loader to disappear, ensuring data is fetched
    await page.waitForFunction(() => {
      const el = document.querySelector('#repo-content');
      // If we see the sketching loader, it's not ready
      if (document.body.innerText.includes('Sketching')) return false;
      // If it has children and doesn't say "Enter a repository", it's ready
      if (el && el.innerText && el.innerText.includes('Oops!')) return true; // Error case
      if (el && el.innerText && el.innerText.includes('No commit history')) return true; // Empty case
      if (el && el.innerText.length > 50) return true; // Data case
      return false;
    }, { timeout: 15000 }).catch(e => console.log('Wait timeout or completed.'));

    // Select the content element
    const element = await page.$('#repo-content');
    
    if (!element) {
      throw new Error('Could not find #repo-content on the page');
    }

    // Take the screenshot
    const screenshotBuffer = await element.screenshot({
      type: 'png',
      captureBeyondViewport: false,
    });
    
    await browser.close();

    imageCache.set(cacheKey, {
      buffer: screenshotBuffer,
      expiresAt: Date.now() + IMAGE_CACHE_TTL_MS,
    });
    if (imageCache.size > 100) {
      const oldestKey = imageCache.keys().next().value;
      if (oldestKey) imageCache.delete(oldestKey);
    }

    // Send the screenshot as PNG image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(screenshotBuffer);
    
  } catch (error) {
    console.error(`Error generating status image for ${repo}:`, error);
    res.status(500).send(`Error generating status image: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
});

// Fallback to index.html for SPA routing if serving statically
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/status?repo=facebook/react`);
});
