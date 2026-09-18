import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  APPROVAL_PROXY_URL,
  assertPrivateBatchUrl,
  buildDecisionPayload,
  emailableLeads,
  extractSessionToken,
  fetchAuthenticatedBatch,
  fetchAuthenticatedCallQueue,
  fetchEnrollmentStatus,
  getApprovalBatchEndpoint,
  getApprovalCallQueueEndpoint,
  getApprovalHealthEndpoint,
  getApprovalProxyEndpoint,
  getApprovalProxyPath,
  getApprovalProxyUrl,
  isEmailLead,
  isRegistrationAvailable,
  normalizeBatch,
  normalizeCallQueue,
  proxyAuthErrorMessage,
  sessionHeaders,
  sessionInvalidKind,
  sessionInvalidMessage,
  submitLeadDecision,
  toIsoDatetime,
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
    assert.equal(
      getApprovalCallQueueEndpoint(),
      'https://authorized-philip-mechanics-rick.trycloudflare.com/call-queue',
    );
    assert.equal(
      getApprovalHealthEndpoint(),
      'https://authorized-philip-mechanics-rick.trycloudflare.com/health',
    );
  });

  it('points batch, call-queue, and decision at the proxy, never public batch.json', () => {
    const batch = getApprovalBatchEndpoint();
    const queue = getApprovalCallQueueEndpoint();
    const decision = getApprovalProxyEndpoint();
    assert.match(batch, /\/batch$/);
    assert.match(queue, /\/call-queue$/);
    assert.match(decision, /\/decision$/);
    assert.doesNotMatch(batch, /batch\.json/);
    assert.doesNotMatch(queue, /batch\.json/);
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
    const allowedQueue = getApprovalCallQueueEndpoint();
    assert.equal(assertPrivateBatchUrl(allowedQueue), allowedQueue);
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

describe('email vs call feeds', () => {
  it('Email tab keeps GET /batch filtered to public-email leads only', () => {
    const emailLead = {
      id: 'email-1',
      email: 'hello@example.com',
      phone: '512-555-0100',
      status: 'ready_for_outreach',
    };
    const publicFieldLead = {
      id: 'email-2',
      email: '',
      email_if_public_business: 'owner@shop.com',
      phone: '512-555-0101',
      status: 'ready_for_outreach',
    };
    const callLead = {
      id: 'call-1',
      email: '',
      phone: '512-555-0199',
      status: 'ready_for_outreach',
    };
    const skipPhone = {
      id: 'call-skip',
      email: '',
      phone: '512-555-0111',
      status: 'skip',
    };
    const neither = {
      id: 'neither',
      email: '  ',
      phone: '',
      status: 'ready_for_outreach',
    };
    const emailable = emailableLeads([
      emailLead,
      publicFieldLead,
      callLead,
      skipPhone,
      neither,
    ]);
    assert.deepEqual(
      emailable.map((lead) => lead.id),
      ['email-1', 'email-2'],
    );
    assert.equal(isEmailLead(callLead), false);
    assert.equal(isEmailLead(skipPhone), false);
  });

  it('never places phone-only leads on the Email tab', () => {
    const emailable = emailableLeads([
      { id: 'phone', phone: '512-555-0100', email: null, status: 'ready' },
    ]);
    assert.equal(emailable.length, 0);
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

  it('sends locked Call outcomes and callback_at only for callback', () => {
    const base = {
      lead: { id: 'phone-only', business_name: 'Phone Shop' },
      batchId: 'leads-csv-2026-09-18',
    };
    assert.deepEqual(buildDecisionPayload({ action: 'interested', ...base }), {
      action: 'interested',
      lead_id: 'phone-only',
      business_name: 'Phone Shop',
      batch_id: 'leads-csv-2026-09-18',
    });
    assert.equal(
      buildDecisionPayload({ action: 'no_answer', ...base }).action,
      'no_answer',
    );
    assert.equal(
      buildDecisionPayload({ action: 'bad_number', ...base }).action,
      'bad_number',
    );
    assert.equal(
      buildDecisionPayload({ action: 'remove', ...base }).action,
      'remove',
    );

    const missingWhen = buildDecisionPayload({ action: 'callback', ...base });
    assert.equal(missingWhen.action, 'callback');
    assert.equal('callback_at' in missingWhen, false);

    const withWhen = buildDecisionPayload({
      action: 'callback',
      ...base,
      callbackAt: '2026-09-20T10:30',
    });
    assert.equal(withWhen.action, 'callback');
    assert.equal(withWhen.callback_at, toIsoDatetime('2026-09-20T10:30'));
    assert.match(withWhen.callback_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.deepEqual(Object.keys(withWhen).sort(), [
      'action',
      'batch_id',
      'business_name',
      'callback_at',
      'lead_id',
    ]);
  });

  it('does not POST invented call outcome actions', () => {
    const payload = buildDecisionPayload({
      action: 'called',
      lead: { id: 'phone-only', business_name: 'Phone Shop' },
      batchId: 'leads-csv-2026-09-18',
    });
    assert.equal(payload.action, 'ping');
  });
});

describe('batch and call-queue normalization', () => {
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

  it('accepts call-queue leads, queue, or a raw array', () => {
    const fromLeads = normalizeCallQueue({
      batch_id: 'q',
      leads: [{ id: 'c1' }],
    });
    assert.equal(fromLeads.batch_id, 'q');
    assert.equal(fromLeads.leads[0].id, 'c1');

    const fromQueue = normalizeCallQueue({
      queue_id: 'ops',
      queue: [{ id: 'c2' }],
    });
    assert.equal(fromQueue.batch_id, 'ops');
    assert.equal(fromQueue.leads[0].id, 'c2');

    const fromArray = normalizeCallQueue([{ id: 'c3' }]);
    assert.equal(fromArray.leads[0].id, 'c3');
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
    assert.match(utils, /fetchAuthenticatedCallQueue/);
    assert.match(utils, /fetchEnrollmentStatus/);
    assert.match(client, /canRegister/);
    assert.match(client, /handleSessionInvalid/);
    assert.match(client, /emailableLeads/);
    assert.match(client, /fetchAuthenticatedCallQueue/);
    assert.doesNotMatch(client, /partitionLeads/);
    assert.match(client, /Email/);
    assert.match(client, /Call/);
    assert.match(client, /No email leads in this batch/);
    assert.match(client, /No call leads in the queue/);
    assert.match(client, /Interested/);
    assert.match(client, /Callback/);
    assert.match(client, /No answer/);
    assert.match(client, /Bad number/);
    assert.match(client, /Remove/);
    assert.match(client, /datetime-local/);
    assert.match(client, /interested/);
    assert.match(client, /no_answer/);
    assert.match(client, /bad_number/);
    assert.doesNotMatch(client, /Call outcomes coming/);
    assert.doesNotMatch(client, /readOnly/);
    assert.doesNotMatch(client, /action:\s*['"]called['"]/);
    assert.doesNotMatch(client, /['"]called['"]/);
    assert.doesNotMatch(client, /\/approve\/batch\.json/);
  });

  it('documents Call tab as GET /call-queue with session headers, not a /batch filter', () => {
    const docs = readFileSync(path.join(root, 'APPROVE.md'), 'utf8');
    assert.match(docs, /GET \$\{APPROVAL_PROXY_URL\}\/call-queue/);
    assert.match(docs, /shared\/local-web\/call-queue\.csv/);
    assert.match(docs, /does \*\*not\*\* build this list by filtering/);
    const client = readFileSync(
      path.join(root, 'app/approve/ApproveClient.js'),
      'utf8',
    );
    assert.doesNotMatch(client, /call-queue\.csv/);
    assert.match(client, /fetchAuthenticatedCallQueue/);
    assert.match(client, /emailableLeads/);
    assert.doesNotMatch(client, /partitionLeads/);
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

  it('loads GET /call-queue with session headers and does not hit /batch', async () => {
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push({
        url: String(url),
        method: init?.method || 'GET',
        headers: init?.headers || {},
      });
      return jsonResponse(200, {
        batch_id: 'call-ops',
        leads: [{ id: 'queue-1', business_name: 'Queue Shop', phone: '512-555-0199' }],
      });
    };
    const result = await fetchAuthenticatedCallQueue('sess-allen-1');
    assert.equal(result.ok, true);
    assert.equal(result.batch.batch_id, 'call-ops');
    assert.equal(result.batch.leads[0].id, 'queue-1');
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/call-queue$/);
    assert.doesNotMatch(calls[0].url, /\/batch$/);
    assert.equal(calls[0].headers.Authorization, 'Bearer sess-allen-1');
    assert.equal(calls[0].headers['X-Session-Token'], 'sess-allen-1');
  });

  it('treats GET /call-queue 401 unauthorized as a session error', async () => {
    globalThis.fetch = async (url) => {
      assert.match(String(url), /\/call-queue$/);
      return jsonResponse(401, { ok: false, error: 'unauthorized' });
    };
    const result = await fetchAuthenticatedCallQueue('sess-old');
    assert.equal(result.ok, false);
    assert.equal(result.unauthorized, true);
    assert.equal(sessionInvalidKind(result), 'unauthorized');
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

  it('refuses callback without callback_at and does not POST', async () => {
    let posted = 0;
    globalThis.fetch = async () => {
      posted += 1;
      return jsonResponse(200, { ok: true });
    };
    const result = await submitLeadDecision({
      action: 'callback',
      lead: { id: 'phone-only', business_name: 'Phone Shop' },
      batch: { batch_id: '2026-09-19' },
      token: 'sess-ok',
    });
    assert.equal(result.reason, 'missing-callback-at');
    assert.equal(result.submittedToProxy, false);
    assert.equal(posted, 0);
  });

  it('POSTs interested and callback with session headers', async () => {
    const bodies = [];
    globalThis.fetch = async (url, init) => {
      bodies.push(JSON.parse(init.body));
      assert.match(init.headers.Authorization, /Bearer sess-ok/);
      assert.equal(init.headers['X-Session-Token'], 'sess-ok');
      return jsonResponse(200, { ok: true });
    };
    const interested = await submitLeadDecision({
      action: 'interested',
      lead: { id: 'phone-a', business_name: 'A' },
      batch: { batch_id: '2026-09-19' },
      token: 'sess-ok',
    });
    assert.equal(interested.submittedToProxy, true);
    assert.deepEqual(bodies[0], {
      action: 'interested',
      lead_id: 'phone-a',
      business_name: 'A',
      batch_id: '2026-09-19',
    });

    const callback = await submitLeadDecision({
      action: 'callback',
      lead: { id: 'phone-b', business_name: 'B' },
      batch: { batch_id: '2026-09-19' },
      token: 'sess-ok',
      callbackAt: '2026-09-20T10:30',
    });
    assert.equal(callback.submittedToProxy, true);
    assert.equal(bodies[1].action, 'callback');
    assert.equal(bodies[1].callback_at, toIsoDatetime('2026-09-20T10:30'));
    assert.equal('callback_at' in bodies[0], false);
  });
});
