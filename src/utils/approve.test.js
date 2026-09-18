import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  APPROVAL_PROXY_URL,
  assertPrivateBatchUrl,
  buildDecisionPayload,
  extractSessionToken,
  fetchAuthenticatedBatch,
  fetchEnrollmentStatus,
  getApprovalBatchEndpoint,
  getApprovalHealthEndpoint,
  getApprovalProxyEndpoint,
  getApprovalProxyPath,
  getApprovalProxyUrl,
  isRegistrationAvailable,
  normalizeBatch,
  proxyAuthErrorMessage,
  sessionHeaders,
  sessionInvalidKind,
  sessionInvalidMessage,
  submitLeadDecision,
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
      getApprovalHealthEndpoint(),
      'https://authorized-philip-mechanics-rick.trycloudflare.com/health',
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
    assert.match(utils, /fetchEnrollmentStatus/);
    assert.match(client, /canRegister/);
    assert.match(client, /handleSessionInvalid/);
    assert.doesNotMatch(client, /\/approve\/batch\.json/);
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
      /Unlock with Face ID/i,
    );
    assert.match(
      proxyAuthErrorMessage({
        ok: false,
        status: 401,
        unauthorized: true,
        reason: 'batch_changed',
      }),
      /batch changed/i,
    );
  });
});

describe('enrollment status', () => {
  it('hides registration when closed or at the credential cap', () => {
    assert.equal(
      isRegistrationAvailable({
        registration_open: true,
        credential_count: 1,
        max_credentials: 2,
      }),
      true,
    );
    assert.equal(
      isRegistrationAvailable({
        registration_open: false,
        credential_count: 1,
        max_credentials: 2,
      }),
      false,
    );
    assert.equal(
      isRegistrationAvailable({
        registration_open: true,
        credential_count: 2,
        max_credentials: 2,
      }),
      false,
    );
    assert.equal(
      isRegistrationAvailable({
        credential_count: 2,
        max_credentials: 2,
      }),
      false,
    );
  });
});

describe('session invalidation', () => {
  it('maps 401 batch_changed and unauthorized to Unlock, not Register', () => {
    assert.equal(
      sessionInvalidKind({
        unauthorized: true,
        status: 401,
        reason: 'batch_changed',
      }),
      'batch_changed',
    );
    assert.equal(
      sessionInvalidKind({
        unauthorized: true,
        status: 401,
        data: { error: 'unauthorized' },
      }),
      'unauthorized',
    );
    assert.match(sessionInvalidMessage('batch_changed'), /batch changed/i);
    assert.match(sessionInvalidMessage('unauthorized'), /Unlock with Face ID/i);
    assert.doesNotMatch(sessionInvalidMessage('batch_changed'), /Register/i);
    assert.doesNotMatch(sessionInvalidMessage('unauthorized'), /Register/i);
  });
});

describe('proxy fetches', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  it('reads GET /health and hides Register when enrollment is full', async () => {
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), method: init?.method || 'GET' });
      return jsonResponse(200, {
        ok: true,
        webauthn: true,
        registration_open: false,
        credential_count: 2,
        max_credentials: 2,
      });
    };
    const status = await fetchEnrollmentStatus();
    assert.equal(status.ok, true);
    assert.equal(status.source, 'health');
    assert.equal(status.registrationAvailable, false);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/health$/);
    assert.equal(calls[0].method, 'GET');
  });

  it('falls back to register/options 403 when health is missing', async () => {
    globalThis.fetch = async (url) => {
      const path = String(url);
      if (path.endsWith('/webauthn/register/options')) {
        return jsonResponse(403, { error: 'registration_closed' });
      }
      return jsonResponse(404, { error: 'not-found' });
    };
    const status = await fetchEnrollmentStatus();
    assert.equal(status.ok, true);
    assert.equal(status.source, 'register-options');
    assert.equal(status.registrationAvailable, false);
  });

  it('treats GET /batch 401 batch_changed as a lock-screen session error', async () => {
    globalThis.fetch = async (url) => {
      assert.doesNotMatch(String(url), /batch\.json/);
      return jsonResponse(401, { ok: false, error: 'batch_changed' });
    };
    const result = await fetchAuthenticatedBatch('sess-old');
    assert.equal(result.ok, false);
    assert.equal(result.unauthorized, true);
    assert.equal(result.reason, 'batch_changed');
    assert.equal(sessionInvalidKind(result), 'batch_changed');
    assert.match(sessionInvalidMessage(sessionInvalidKind(result)), /Unlock/);
  });

  it('treats POST /decision 401 unauthorized as a session error', async () => {
    globalThis.fetch = async (url, init) => {
      assert.equal(init.method, 'POST');
      return jsonResponse(401, { ok: false, error: 'unauthorized' });
    };
    const result = await submitLeadDecision({
      action: 'approve',
      lead: { id: 'lead-001', business_name: 'Example' },
      batch: { batch_id: '2026-09-19' },
      token: 'sess-old',
    });
    assert.equal(result.unauthorized, true);
    assert.equal(result.reason, 'unauthorized');
    assert.equal(sessionInvalidKind(result), 'unauthorized');
    assert.equal(result.recordedLocally, false);
  });
});
