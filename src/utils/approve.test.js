import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  APPROVAL_PROXY_URL,
  assertPrivateBatchUrl,
  buildDecisionPayload,
  extractSessionToken,
  getApprovalBatchEndpoint,
  getApprovalProxyEndpoint,
  getApprovalProxyPath,
  getApprovalProxyUrl,
  normalizeBatch,
  proxyAuthErrorMessage,
  sessionHeaders,
} from './approve.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('approval proxy paths', () => {
  it('is wired to the live CoS Cloudflare proxy', () => {
    assert.equal(
      getApprovalProxyUrl(),
      'https://authorized-philip-mechanics-rick.trycloudflare.com',
    );
    assert.equal(
      APPROVAL_PROXY_URL,
      'https://authorized-philip-mechanics-rick.trycloudflare.com',
    );
    assert.equal(
      getApprovalBatchEndpoint(),
      'https://authorized-philip-mechanics-rick.trycloudflare.com/batch',
    );
  });

  it('points batch and decision at the proxy, never public batch.json', () => {
    const batch = getApprovalBatchEndpoint();
    const decision = getApprovalProxyEndpoint();
    assert.match(batch, /\/batch$/);
    assert.match(decision, /\/decision$/);
    assert.doesNotMatch(batch, /batch\.json/);
    assert.doesNotMatch(decision, /batch\.json/);
    assert.equal(
      getApprovalProxyPath('webauthn/login/verify').endsWith(
        '/webauthn/login/verify',
      ),
      true,
    );
  });

  it('refuses the public GitHub Pages batch file', () => {
    assert.throws(
      () => assertPrivateBatchUrl('/approve/batch.json'),
      /refusing-public-batch/,
    );
    assert.throws(
      () =>
        assertPrivateBatchUrl(
          'https://aruizdevelops.github.io/approve/batch.json',
        ),
      /refusing-public-batch/,
    );
    const allowed = getApprovalBatchEndpoint();
    assert.equal(assertPrivateBatchUrl(allowed), allowed);
  });
});

describe('session headers and tokens', () => {
  it('sends Bearer and X-Session-Token without a webhook key', () => {
    const headers = sessionHeaders('sess-allen-1');
    assert.equal(headers.Authorization, 'Bearer sess-allen-1');
    assert.equal(headers['X-Session-Token'], 'sess-allen-1');
    assert.equal(headers['Content-Type'], 'application/json');
    const raw = JSON.stringify(headers);
    assert.doesNotMatch(raw, /cursor\.sh/i);
    assert.doesNotMatch(raw, /sender/i);
  });

  it('omits auth headers when no session exists', () => {
    const headers = sessionHeaders('', { json: false });
    assert.equal(headers.Authorization, undefined);
    assert.equal(headers['X-Session-Token'], undefined);
  });

  it('extracts session_token from login verify payloads', () => {
    assert.equal(extractSessionToken({ session_token: 'abc' }), 'abc');
    assert.equal(extractSessionToken({ token: 'xyz' }), 'xyz');
    assert.equal(extractSessionToken({ ok: true }), '');
  });
});

describe('decision payload', () => {
  it('keeps Accept/Skip body {action, lead_id, business_name, batch_id}', () => {
    const payload = buildDecisionPayload({
      action: 'approve',
      lead: { id: 'adolph-s-barber-shop', business_name: "Adolph's Barber Shop" },
      batchId: 'leads-csv-2026-09-18',
    });
    assert.deepEqual(Object.keys(payload).sort(), [
      'action',
      'batch_id',
      'business_name',
      'lead_id',
    ]);
    assert.deepEqual(payload, {
      action: 'approve',
      lead_id: 'adolph-s-barber-shop',
      business_name: "Adolph's Barber Shop",
      batch_id: 'leads-csv-2026-09-18',
    });
  });
});

describe('batch normalization', () => {
  it('accepts a raw batch or { batch } wrapper', () => {
    const raw = normalizeBatch({
      batch_id: 'x',
      leads: [{ id: 'a', business_name: 'A' }],
    });
    assert.equal(raw.batch_id, 'x');
    assert.equal(raw.leads.length, 1);
    const wrapped = normalizeBatch({
      batch: { batchId: 'y', leads: [] },
    });
    assert.equal(wrapped.batch_id, 'y');
    assert.deepEqual(wrapped.leads, []);
  });
});

describe('public batch.json placeholder', () => {
  it('does not publish a real lead list', () => {
    const raw = readFileSync(
      path.join(root, 'public/approve/batch.json'),
      'utf8',
    );
    const data = JSON.parse(raw);
    assert.deepEqual(data.leads, []);
    assert.doesNotMatch(raw.toLowerCase(), /barber/);
    assert.doesNotMatch(raw.toLowerCase(), /salon/);
    assert.doesNotMatch(raw, /lead-001/);
    assert.doesNotMatch(raw, /Adolph/);
  });

  it('client source never fetches /approve/batch.json', () => {
    const client = readFileSync(
      path.join(root, 'app/approve/ApproveClient.js'),
      'utf8',
    );
    const utils = readFileSync(path.join(root, 'src/utils/approve.js'), 'utf8');
    assert.doesNotMatch(client, /APPROVE_BATCH_URL/);
    assert.doesNotMatch(client, /\/approve\/batch\.json/);
    assert.doesNotMatch(utils, /export const APPROVE_BATCH_URL/);
    assert.match(utils, /fetchAuthenticatedBatch/);
  });
});

describe('live proxy error copy', () => {
  it('maps first-time enroll and unauthorized errors', () => {
    assert.match(
      proxyAuthErrorMessage({
        ok: false,
        status: 400,
        reason: 'no credentials registered',
      }),
      /Register this device/,
    );
    assert.match(
      proxyAuthErrorMessage({
        ok: false,
        status: 401,
        unauthorized: true,
        reason: 'unauthorized',
      }),
      /not authorized/i,
    );
  });
});
