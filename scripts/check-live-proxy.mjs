/**
 * Live contract check against the CoS approval proxy.
 * Does not complete WebAuthn (RP ID is aruizdevelops.github.io).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APPROVAL_PROXY_URL } from '../src/config/approval.js';
import { toCreationOptions } from '../src/utils/webauthn.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROXY = 'https://authorized-philip-mechanics-rick.trycloudflare.com';

async function getJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { status: response.status, data, headers: response.headers };
}

async function main() {
  assert.equal(APPROVAL_PROXY_URL, PROXY);

  const publicBatch = JSON.parse(
    readFileSync(path.join(root, 'public/approve/batch.json'), 'utf8'),
  );
  assert.deepEqual(publicBatch.leads, []);

  const health = await getJson(`${PROXY}/`);
  assert.equal(health.status, 200);
  assert.equal(health.data.ok, true);
  assert.equal(health.data.webauthn, true);

  const batch = await getJson(`${PROXY}/batch`);
  assert.equal(batch.status, 401);
  assert.equal(batch.data.ok, false);
  assert.equal(batch.data.error, 'unauthorized');

  const options = await getJson(`${PROXY}/webauthn/register/options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://aruizdevelops.github.io',
    },
    body: '{}',
  });
  assert.equal(options.status, 200);
  assert.equal(options.data.rp?.id, 'aruizdevelops.github.io');
  assert.ok(options.data.challenge);
  assert.ok(options.data.challenge_id);
  const publicKey = toCreationOptions(options.data).publicKey;
  assert.equal(publicKey.rp.id, 'aruizdevelops.github.io');
  assert.equal('challenge_id' in publicKey, false);

  const login = await getJson(`${PROXY}/webauthn/login/options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://aruizdevelops.github.io',
    },
    body: '{}',
  });
  if (health.data.credential_count === 0) {
    assert.equal(login.status, 400);
    assert.equal(login.data.error, 'no credentials registered');
  } else {
    assert.equal(login.status, 200);
    assert.ok(login.data.challenge);
  }

  const ping = await getJson(`${PROXY}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ping',
      lead_id: '',
      business_name: '',
      batch_id: '',
    }),
  });
  assert.equal(ping.status, 200);

  console.log(
    JSON.stringify(
      {
        ok: true,
        proxy: PROXY,
        webauthn: health.data.webauthn,
        credential_count: health.data.credential_count,
        batch_unauthorized: batch.status === 401,
        register_options: options.status,
        rp_id: options.data.rp?.id,
        public_leads: publicBatch.leads.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
