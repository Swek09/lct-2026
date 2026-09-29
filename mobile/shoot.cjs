const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function shoot(url, out, waitMs = 1500) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', (req) => console.log('REQ FAILED:', req.url()));
  await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise((r) => setTimeout(r, waitMs));
  const info = await page.evaluate(() => window.__info || 'no info');
  await page.screenshot({ path: out });
  console.log('--- ' + out + ' ---');
  console.log(info);
  await browser.close();
}

(async () => {
  const base = 'http://127.0.0.1:8091';
  const model = process.argv[2] || 'cat.glb';
  const method = process.argv[3] || 'none';
  const color = process.argv[4] || '';
  const out = process.argv[5] || require('path').join(__dirname, 'public/render_out.png');
  const q = new URLSearchParams({ model, method });
  if (color) q.set('color', color);
  await shoot(`${base}/test-tint.html?${q.toString()}`, out, 1800);
})();
