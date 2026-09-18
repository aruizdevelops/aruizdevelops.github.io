/**
 * End-to-end check for the /approve/ passkey gate against the production
 * static export. Intercepts APPROVAL_PROXY_URL so the live tunnel is not hit.
 *
 *   node scripts/test-approve-gate.mjs
 */
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROXY_HOST = 'authorized-philip-mechanics-rick.trycloudflare.com';
const SESSION_TOKEN = 'test-session-token-allen';
const TEST_BATCH = {
  batch_id: 'e2e-internal',
  generated_at: '2026-09-18T18:00:00.000Z',
  region: 'internal',
  leads: [
    {
      id: 'internal-test-lead',
      business_name: 'Internal Test Lead',
      niche: 'test',
      city: 'Austin',
      phone: '',
      email: '',
      why: 'E2E fixture only; not published on GitHub Pages.',
      website_url: '',
      maps_url: '',
      status: 'ready_for_outreach',
    },
  ],
};

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers':
      'Content-Type, Authorization, X-Session-Token',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sessionFrom(req) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const alt = req.headers['x-session-token'];
  return bearer || alt || '';
}

async function startStaticServer() {
  const proc = spawn(
    'python3',
    ['-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', 'out'],
    { cwd: root, stdio: 'pipe' },
  );
  await once(proc, 'spawn');
  await new Promise((r) => setTimeout(r, 400));
  return proc;
}

async function startMockProxy() {
  const decisions = [];
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-headers':
          'Content-Type, Authorization, X-Session-Token',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
      });
      res.end();
      return;
    }

    try {
      if (req.method === 'POST' && url.pathname === '/webauthn/register/options') {
        json(res, 200, {
          challenge: b64url(randomBytes(32)),
          rp: { name: 'Texas Craft Sites', id: 'localhost' },
          user: {
            id: b64url(Buffer.from('allen')),
            name: 'allen',
            displayName: 'Allen',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          timeout: 60000,
          attestation: 'none',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
          },
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/webauthn/register/verify') {
        const body = await readBody(req);
        if (!body.id || !body.response?.attestationObject) {
          json(res, 400, { error: 'missing-attestation' });
          return;
        }
        json(res, 200, { verified: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/webauthn/login/options') {
        json(res, 200, {
          challenge: b64url(randomBytes(32)),
          timeout: 60000,
          rpId: 'localhost',
          userVerification: 'required',
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/webauthn/login/verify') {
        const body = await readBody(req);
        if (!body.id || !body.response?.signature) {
          json(res, 400, { error: 'missing-assertion' });
          return;
        }
        json(res, 200, { session_token: SESSION_TOKEN });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/batch') {
        if (sessionFrom(req) !== SESSION_TOKEN) {
          json(res, 401, { error: 'unauthorized' });
          return;
        }
        json(res, 200, TEST_BATCH);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/decision') {
        if (sessionFrom(req) !== SESSION_TOKEN) {
          json(res, 401, { error: 'unauthorized' });
          return;
        }
        const body = await readBody(req);
        decisions.push(body);
        json(res, 200, { ok: true });
        return;
      }

      json(res, 404, { error: 'not-found' });
    } catch (error) {
      json(res, 500, { error: String(error) });
    }
  });

  await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));
  return { server, decisions };
}

async function main() {
  const staticProc = await startStaticServer();
  const { server, decisions } = await startMockProxy();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`pageerror: ${err.message}`));

  await page.route(`https://${PROXY_HOST}/**`, async (route) => {
    const req = route.request();
    const target = req.url().replace(`https://${PROXY_HOST}`, 'http://127.0.0.1:4174');
    const headers = { ...req.headers() };
    const response = await page.request.fetch(target, {
      method: req.method(),
      headers,
      data: req.postData(),
      failOnStatusCode: false,
    });
    await route.fulfill({
      status: response.status(),
      headers: response.headers(),
      body: await response.body(),
    });
  });

  const cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });

  const failures = [];
  const shot = async (name) => {
    const dest = path.join('/opt/cursor/artifacts', name);
    await page.screenshot({ path: dest, fullPage: true });
    return dest;
  };

  try {
    await page.goto('http://localhost:4173/approve/', { waitUntil: 'networkidle' });
    const lockTitle = await page.locator('.approve-lock-title').textContent();
    if (!/Unlock with Face ID/.test(lockTitle || '')) {
      failures.push(`missing lock title: ${lockTitle}`);
    }
    const registerVisible = await page.getByRole('button', {
      name: 'Register this device',
    }).isVisible();
    const unlockVisible = await page.getByRole('button', {
      name: 'Unlock with Face ID / Touch ID',
    }).isVisible();
    if (!registerVisible || !unlockVisible) {
      failures.push('lock CTAs missing');
    }
    const leaked = await page.locator('.approve-card').count();
    if (leaked !== 0) {
      failures.push(`lock screen leaked ${leaked} cards`);
    }
    await shot('approve_lock_screen.png');

    const publicBatch = await page.request.get(
      'http://localhost:4173/approve/batch.json',
    );
    const publicJson = await publicBatch.json();
    if (!Array.isArray(publicJson.leads) || publicJson.leads.length !== 0) {
      failures.push('public batch.json is not empty');
    }

    await page.getByRole('button', { name: 'Register this device' }).click();
    await page.waitForSelector('.approve-card, .approve-error', {
      timeout: 15000,
    });
    const enrollError = await page.locator('.approve-lock .approve-error').textContent().catch(() => '');
    if (enrollError) {
      failures.push(`enroll error: ${enrollError}`);
    }
    await page.waitForSelector('.approve-card', { timeout: 15000 });
    const name = await page.locator('.approve-name').first().textContent();
    if (!/Internal Test Lead/.test(name || '')) {
      failures.push(`unexpected card after enroll: ${name}`);
    }
    await shot('approve_unlocked_after_enroll.png');

    await page.getByRole('button', { name: 'Accept' }).click();
    await page.waitForSelector('.approve-done-bar', { timeout: 10000 });
    if (decisions.length !== 1) {
      failures.push(`expected 1 decision, got ${decisions.length}`);
    } else {
      const body = decisions[0];
      const keys = Object.keys(body).sort().join(',');
      if (keys !== 'action,batch_id,business_name,lead_id') {
        failures.push(`decision body keys: ${keys}`);
      }
      if (body.action !== 'approve' || body.lead_id !== 'internal-test-lead') {
        failures.push(`bad decision payload ${JSON.stringify(body)}`);
      }
    }
    await shot('approve_accept_recorded.png');

    await page.getByRole('button', { name: 'Lock' }).click();
    await page.waitForSelector('.approve-lock-title', { timeout: 5000 });
    if ((await page.locator('.approve-card').count()) !== 0) {
      failures.push('cards still visible after Lock');
    }

    await page.getByRole('button', { name: 'Unlock with Face ID / Touch ID' }).click();
    await page.waitForSelector('.approve-card', { timeout: 15000 });
    await shot('approve_unlocked_later_visit.png');
  } catch (error) {
    failures.push(String(error?.stack || error));
    if (logs.length) failures.push(`logs: ${logs.join(' | ')}`);
    const visibleError = await page.locator('.approve-error').allTextContents().catch(() => []);
    if (visibleError.length) failures.push(`ui: ${visibleError.join(' | ')}`);
    try {
      await shot('approve_gate_failure.png');
    } catch {
      // ignore
    }
  } finally {
    await browser.close();
    server.close();
    staticProc.kill('SIGTERM');
  }

  if (failures.length) {
    console.error('FAIL');
    for (const failure of failures) console.error(' -', failure);
    process.exit(1);
  }
  console.log('PASS passkey gate enroll/unlock/batch/decision');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
