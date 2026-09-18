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
      id: 'internal-email-lead',
      business_name: 'Internal Email Lead',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0100',
      email: 'shop@example.com',
      why: 'E2E fixture only; not published on GitHub Pages.',
      website_url: '',
      maps_url: '',
      status: 'ready_for_outreach',
    },
    {
      id: 'internal-call-lead',
      business_name: 'Internal Call Lead',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0199',
      email: '',
      why: 'E2E fixture only; not published on GitHub Pages.',
      website_url: '',
      maps_url: '',
      status: 'ready_for_outreach',
    },
    {
      id: 'internal-callback-lead',
      business_name: 'Internal Callback Lead',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0188',
      email: '',
      why: 'E2E fixture only; not published on GitHub Pages.',
      website_url: '',
      maps_url: '',
      status: 'ready_for_outreach',
    },
    {
      id: 'internal-skip-phone',
      business_name: 'Internal Skip Phone',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0111',
      email: '',
      why: 'E2E fixture only; not published on GitHub Pages.',
      website_url: '',
      maps_url: '',
      status: 'skip',
    },
  ],
};

const TEST_CALL_QUEUE = {
  batch_id: 'e2e-call-queue',
  generated_at: '2026-09-18T18:00:00.000Z',
  region: 'internal',
  leads: [
    {
      id: 'queue-call-lead',
      business_name: 'Queue Call Lead',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0299',
      email: '',
      why: 'Served from GET /call-queue, not a /batch filter.',
      website_url: '',
      maps_url: '',
      status: 'ready_for_outreach',
    },
    {
      id: 'queue-callback-lead',
      business_name: 'Queue Callback Lead',
      niche: 'test',
      city: 'Austin',
      phone: '512-555-0288',
      email: '',
      why: 'Served from GET /call-queue, not a /batch filter.',
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
  const state = {
    registrationOpen: true,
    credentialCount: 1,
    maxCredentials: 2,
    batchError: '',
    registerCalls: 0,
    loginCalls: 0,
    healthCalls: 0,
    batchCalls: 0,
    callQueueCalls: 0,
  };
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
      if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
        state.healthCalls += 1;
        json(res, 200, {
          ok: true,
          service: 'tcs-approval-proxy',
          webauthn: true,
          credential_count: state.credentialCount,
          max_credentials: state.maxCredentials,
          registration_open: state.registrationOpen,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/webauthn/register/options') {
        state.registerCalls += 1;
        if (!state.registrationOpen || state.credentialCount >= state.maxCredentials) {
          json(res, 403, { error: 'registration_closed' });
          return;
        }
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
        state.loginCalls += 1;
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
        state.batchCalls += 1;
        if (state.batchError) {
          json(res, 401, { ok: false, error: state.batchError });
          return;
        }
        if (sessionFrom(req) !== SESSION_TOKEN) {
          json(res, 401, { error: 'unauthorized' });
          return;
        }
        json(res, 200, TEST_BATCH);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/call-queue') {
        state.callQueueCalls += 1;
        if (state.batchError) {
          json(res, 401, { ok: false, error: state.batchError });
          return;
        }
        if (sessionFrom(req) !== SESSION_TOKEN) {
          json(res, 401, { error: 'unauthorized' });
          return;
        }
        json(res, 200, TEST_CALL_QUEUE);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/decision') {
        if (state.batchError) {
          json(res, 401, { ok: false, error: state.batchError });
          return;
        }
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
  return { server, decisions, state };
}

async function main() {
  const staticProc = await startStaticServer();
  const { server, decisions, state } = await startMockProxy();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const logs = [];
  page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`pageerror: ${err.message}`));

  await context.route(`https://${PROXY_HOST}/**`, async (route) => {
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
    const emailTab = page.getByRole('tab', { name: /Email/ });
    const callTab = page.getByRole('tab', { name: /Call/ });
    if (!(await emailTab.isVisible()) || !(await callTab.isVisible())) {
      failures.push('Email | Call tabs missing after unlock');
    }
    const name = await page.locator('.approve-name').first().textContent();
    if (!/Internal Email Lead/.test(name || '')) {
      failures.push(`unexpected Email-tab card after enroll: ${name}`);
    }
    if ((await page.getByRole('button', { name: 'Accept' }).count()) === 0) {
      failures.push('Accept missing on Email tab');
    }
    if ((await page.locator('.approve-name').count()) !== 1) {
      failures.push('Email tab should show only the emailable lead');
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
      if (body.action !== 'approve' || body.lead_id !== 'internal-email-lead') {
        failures.push(`bad decision payload ${JSON.stringify(body)}`);
      }
    }
    await shot('approve_accept_recorded.png');

    await callTab.click();
    await page.waitForSelector('.approve-btn-callback, .approve-status-msg', {
      timeout: 5000,
    });
    const callNames = await page.locator('.approve-name').allTextContents();
    if (!callNames.some((text) => /Queue Call Lead/.test(text))) {
      failures.push(`Call tab missing /call-queue lead: ${callNames.join(' | ')}`);
    }
    if (!callNames.some((text) => /Queue Callback Lead/.test(text))) {
      failures.push(`Call tab missing queue callback lead: ${callNames.join(' | ')}`);
    }
    if (callNames.some((text) => /Internal Email Lead/.test(text))) {
      failures.push('Email lead leaked onto Call tab');
    }
    if (callNames.some((text) => /Internal Call Lead/.test(text))) {
      failures.push('Call tab used GET /batch phone-only filter instead of /call-queue');
    }
    if (callNames.some((text) => /Internal Skip Phone/.test(text))) {
      failures.push('skip-status phone lead appeared on Call tab');
    }
    if (state.callQueueCalls < 1) {
      failures.push('Call tab never requested GET /call-queue');
    }
    if ((await page.getByRole('button', { name: 'Accept' }).count()) !== 0) {
      failures.push('Accept shown on Call tab');
    }
    if ((await page.getByRole('button', { name: 'Skip' }).count()) !== 0) {
      failures.push('Skip shown on Call tab');
    }
    if ((await page.getByRole('button', { name: 'Called' }).count()) !== 0) {
      failures.push('Called button shipped on Call tab');
    }
    for (const label of ['Interested', 'Callback', 'No answer', 'Bad number', 'Remove']) {
      if ((await page.getByRole('button', { name: label }).count()) === 0) {
        failures.push(`missing Call button: ${label}`);
      }
    }
    await shot('approve_call_tab_outcomes.png');

    await page.getByRole('button', { name: 'Callback' }).first().click();
    const callbackError =
      (await page.locator('.approve-error').first().textContent().catch(() => '')) ||
      '';
    if (!/callback date and time/i.test(callbackError)) {
      failures.push(`missing required callback picker error: ${callbackError}`);
    }
    if (decisions.length !== 1) {
      failures.push(
        `Callback without datetime posted: ${JSON.stringify(decisions)}`,
      );
    }

    await page.getByRole('button', { name: 'Interested' }).first().click();
    await page.waitForSelector('.approve-done-bar', { timeout: 10000 });
    if (decisions.length !== 2) {
      failures.push(`expected Interested decision, got ${decisions.length}`);
    } else if (decisions[1].action !== 'interested' || decisions[1].lead_id !== 'queue-call-lead') {
      failures.push(`bad interested payload ${JSON.stringify(decisions[1])}`);
    } else if (Object.keys(decisions[1]).sort().join(',') !== 'action,batch_id,business_name,lead_id') {
      failures.push(`interested extra keys ${Object.keys(decisions[1])}`);
    }
    await shot('approve_call_interested.png');

    const callbackLead = page.locator('.approve-card').filter({
      hasText: 'Queue Callback Lead',
    });
    await callbackLead.locator('input[type="datetime-local"]').fill('2026-09-20T10:30');
    await callbackLead.getByRole('button', { name: 'Callback' }).click();
    await callbackLead.locator('.approve-done-bar').waitFor({ timeout: 10000 });
    if (decisions.length !== 3) {
      failures.push(`expected Callback decision, got ${decisions.length}`);
    } else {
      const body = decisions[2];
      if (body.action !== 'callback' || body.lead_id !== 'queue-callback-lead') {
        failures.push(`bad callback payload ${JSON.stringify(body)}`);
      }
      if (!body.callback_at || Number.isNaN(Date.parse(body.callback_at))) {
        failures.push(`callback_at missing/invalid ${JSON.stringify(body)}`);
      }
      const keys = Object.keys(body).sort().join(',');
      if (keys !== 'action,batch_id,business_name,callback_at,lead_id') {
        failures.push(`callback body keys: ${keys}`);
      }
    }
    await shot('approve_call_callback.png');

    await emailTab.click();
    await page.waitForSelector('.approve-done-bar', { timeout: 5000 });
    if ((await page.getByRole('button', { name: 'Interested' }).count()) !== 0) {
      failures.push('Call outcomes leaked onto Email tab');
    }

    await page.getByRole('button', { name: 'Lock' }).click();
    await page.waitForSelector('.approve-lock-title', { timeout: 5000 });
    if ((await page.locator('.approve-card').count()) !== 0) {
      failures.push('cards still visible after Lock');
    }

    await page.getByRole('button', { name: 'Unlock with Face ID / Touch ID' }).click();
    await page.waitForSelector('.approve-card', { timeout: 15000 });
    await shot('approve_unlocked_later_visit.png');

    await page.getByRole('button', { name: 'Lock' }).click();
    await page.waitForSelector('.approve-lock-title', { timeout: 5000 });
    state.registrationOpen = false;
    state.credentialCount = 2;
    const registerCallsBeforeClosed = state.registerCalls;
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.approve-lock-title', { timeout: 10000 });
    const registerWhenFull = await page.getByRole('button', {
      name: 'Register this device',
    }).count();
    const unlockWhenFull = await page.getByRole('button', {
      name: 'Unlock with Face ID / Touch ID',
    }).isVisible();
    if (registerWhenFull !== 0) {
      failures.push('Register still visible when enrollment is full');
    }
    if (!unlockWhenFull) {
      failures.push('Unlock missing when enrollment is full');
    }
    if (state.registerCalls !== registerCallsBeforeClosed) {
      failures.push('lock screen auto-posted register/options while enrollment is full');
    }
    if ((await page.locator('.approve-card').count()) !== 0) {
      failures.push('cards visible on full-enrollment lock screen');
    }
    await shot('approve_lock_enrollment_full.png');

    await page.getByRole('button', { name: 'Unlock with Face ID / Touch ID' }).click();
    await page.waitForSelector('.approve-card', { timeout: 15000 });
    const registerCallsBeforeChanged = state.registerCalls;
    const loginCallsBeforeChanged = state.loginCalls;
    state.batchError = 'batch_changed';
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.approve-lock-title', { timeout: 10000 });
    const changedCopy = (await page.locator('.approve-lock').textContent()) || '';
    if (!/batch changed/i.test(changedCopy)) {
      failures.push(`missing batch_changed prompt: ${changedCopy}`);
    }
    if (!/Unlock with Face ID/.test(changedCopy)) {
      failures.push('batch_changed lock screen did not prompt Unlock');
    }
    if ((await page.getByRole('button', { name: 'Register this device' }).count()) !== 0) {
      failures.push('Register shown after batch_changed');
    }
    if ((await page.locator('.approve-card').count()) !== 0) {
      failures.push('cards still visible after batch_changed');
    }
    if (state.registerCalls !== registerCallsBeforeChanged) {
      failures.push('batch_changed auto-registered');
    }
    if (state.loginCalls !== loginCallsBeforeChanged) {
      failures.push('batch_changed auto-unlocked with Face ID');
    }
    const tokenAfterChanged = await page.evaluate(() =>
      sessionStorage.getItem('tcs-approve-session'),
    );
    if (tokenAfterChanged) {
      failures.push('session token still present after batch_changed');
    }
    await shot('approve_lock_batch_changed.png');
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
  console.log('PASS passkey gate enroll/unlock/full-enrollment/batch_changed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
