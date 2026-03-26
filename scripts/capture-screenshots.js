/**
 * Captures screenshots of tenant apps for portfolio gallery images.
 *
 * Usage:
 *   1. Start both tenant apps on different ports:
 *      - Fruteria del Sol:    cd ../bluebonnet-tech-tenant-demo && PORT=3001 npm run dev
 *      - Sage & Stone:        cd ../bluebonnet-tech-tenant-sage-stone && PORT=3002 npm run dev
 *   2. Run this script:
 *      npm run capture-screenshots
 */

const { chromium } = require('playwright');
const path = require('path');

const FRUTERIA_BASE = process.env.FRUTERIA_URL || 'http://localhost:3001/bluebonnet-tech-tenant-demo';
const SAGE_BASE = process.env.SAGE_URL || 'http://localhost:3002/bluebonnet-tech-tenant-sage-stone';

const OUTPUT_DIR = path.resolve(__dirname, '../public/images/projects');

const SCREENSHOTS = [
  // Fruteria del Sol
  {
    url: FRUTERIA_BASE,
    output: 'fruteria/landing.png',
    viewport: { width: 1440, height: 900 },
    fullPage: true,
    label: 'Fruteria - Landing (Desktop)',
  },
  {
    url: `${FRUTERIA_BASE}/admin`,
    output: 'fruteria/menu.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Fruteria - Admin / Menu',
  },
  {
    url: FRUTERIA_BASE,
    output: 'fruteria/mobile.png',
    viewport: { width: 390, height: 844 },
    fullPage: true,
    label: 'Fruteria - Mobile',
  },
  {
    url: FRUTERIA_BASE,
    output: 'fruteria/thumbnail.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Fruteria - Thumbnail',
  },
  {
    url: FRUTERIA_BASE,
    output: 'fruteria/hero.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Fruteria - Hero',
  },

  // Sage & Stone Wellness
  {
    url: SAGE_BASE,
    output: 'sage-stone/landing.png',
    viewport: { width: 1440, height: 900 },
    fullPage: true,
    label: 'Sage & Stone - Landing (Desktop)',
  },
  {
    url: `${SAGE_BASE}/book`,
    output: 'sage-stone/booking.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Sage & Stone - Booking',
  },
  {
    url: `${SAGE_BASE}/admin`,
    output: 'sage-stone/admin.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Sage & Stone - Admin Dashboard',
  },
  {
    url: SAGE_BASE,
    output: 'sage-stone/mobile.png',
    viewport: { width: 390, height: 844 },
    fullPage: true,
    label: 'Sage & Stone - Mobile',
  },
  {
    url: SAGE_BASE,
    output: 'sage-stone/thumbnail.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Sage & Stone - Thumbnail',
  },
  {
    url: SAGE_BASE,
    output: 'sage-stone/hero.png',
    viewport: { width: 1440, height: 900 },
    fullPage: false,
    label: 'Sage & Stone - Hero',
  },
];

async function captureScreenshots() {
  const browser = await chromium.launch();

  for (const shot of SCREENSHOTS) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    try {
      console.log(`Capturing: ${shot.label}...`);
      await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait for fonts and animations to settle
      await page.waitForTimeout(1500);

      const outputPath = path.join(OUTPUT_DIR, shot.output);
      await page.screenshot({
        path: outputPath,
        fullPage: shot.fullPage,
      });
      console.log(`  Saved: ${shot.output}`);
    } catch (err) {
      console.error(`  Failed: ${shot.label} - ${err.message}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to public/images/projects/');
}

captureScreenshots();
