import { APPROVAL_PROXY_URL } from '../config/approval.js';
import { buildMailto } from './mailto.js';
import {
  createCredential,
  getCredential,
  isWebAuthnSupported,
  unwrapPublicKeyOptions,
  webAuthnErrorMessage,
} from './webauthn.js';

export const APPROVE_NOTIFY_EMAIL = 'allen.s.ruiz1@gmail.com';
export const APPROVE_STORAGE_KEY = 'tcs-lead-approvals';
export const APPROVE_SESSION_KEY = 'tcs-approve-session';
export const APPROVE_ENROLLED_KEY = 'tcs-approve-enrolled';

const MAX_TEXT_LENGTH = 200;
const ALLOWED_ACTIONS = new Set(['approve', 'skip', 'ping']);

export { APPROVAL_PROXY_URL, isWebAuthnSupported, webAuthnErrorMessage };

export function getApprovalProxyUrl() {
  const raw =
    typeof APPROVAL_PROXY_URL === 'string' ? APPROVAL_PROXY_URL.trim() : '';
  const base = raw.replace(/\/+$/, '');
  return isHttpUrl(base) ? base : '';
}

export function getApprovalProxyPath(path) {
  const base = getApprovalProxyUrl();
  if (!base) return '';
  const suffix = String(path || '').replace(/^\/+/, '');
  return suffix ? `${base}/${suffix}` : base;
}

export function getApprovalProxyEndpoint() {
  return getApprovalProxyPath('decision');
}

export function getApprovalBatchEndpoint() {
  return getApprovalProxyPath('batch');
}

export function getApprovalHealthEndpoint() {
  return getApprovalProxyPath('health');
}

export function isApprovalProxyConfigured() {
  return Boolean(getApprovalProxyUrl());
}

function isHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeText(value, max = MAX_TEXT_LENGTH) {
  if (value == null) return '';
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function formatStatusLabel(status) {
  const raw = sanitizeText(status, 40);
  if (!raw) return 'ready for outreach';
  return raw.replace(/_/g, ' ').toLowerCase();
}

export function statusTone(status) {
  const normalized = formatStatusLabel(status);
  if (normalized.includes('research')) return 'research';
  if (normalized.includes('skip')) return 'skip';
  if (normalized.includes('accept') || normalized.includes('approv')) {
    return 'accept';
  }
  return 'ready';
}

export function formatBatchDate(iso, batchId) {
  const value = iso || batchId;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(batchId || '');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

export function formatCountLine(counts) {
  return [...counts.entries()]
    .map(([label, count]) => `${label} ${count}`)
    .join(' · ');
}

function fieldAsEmail(value) {
  if (typeof value !== 'string') return '';
  return sanitizeText(value, 200);
}

export function getPublicEmail(lead) {
  return (
    fieldAsEmail(lead?.email) || fieldAsEmail(lead?.email_if_public_business)
  );
}

export function hasPhone(lead) {
  return Boolean(sanitizeText(lead?.phone, 80));
}

export function isSkipStatus(lead) {
  return formatStatusLabel(lead?.status).includes('skip');
}

export function isEmailLead(lead) {
  return Boolean(getPublicEmail(lead));
}

export function isCallLead(lead) {
  return hasPhone(lead) && !isEmailLead(lead) && !isSkipStatus(lead);
}

export function partitionLeads(leads) {
  const list = Array.isArray(leads) ? leads : [];
  return {
    email: list.filter(isEmailLead),
    call: list.filter(isCallLead),
  };
}

export function buildVerifyLinks(lead) {
  const name = sanitizeText(lead?.business_name, 120);
  const city = sanitizeText(lead?.city, 80);
  const query = [name, city].filter(Boolean).join(', ');
  const links = [];

  const website = sanitizeText(lead?.website_url, 500);
  if (isHttpUrl(website)) {
    links.push({ label: 'Site', href: website });
  }

  const maps = sanitizeText(lead?.maps_url, 500);
  if (isHttpUrl(maps)) {
    links.push({ label: 'Maps', href: maps });
  } else if (query) {
    links.push({
      label: 'Maps',
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    });
  }

  if (name) {
    const googleQuery = [name, city].filter(Boolean).join(' ');
    links.push({
      label: 'Google',
      href: `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`,
    });
  }

  return links;
}

export function buildDecisionPayload({ action, lead, batchId }) {
  const verb = ALLOWED_ACTIONS.has(action) ? action : 'ping';
  return {
    action: verb,
    lead_id: sanitizeText(lead?.id, 80),
    business_name: sanitizeText(lead?.business_name, 120),
    batch_id: sanitizeText(batchId, 80),
  };
}

export function buildDecisionMailto({ action, lead, batchId }) {
  const payload = buildDecisionPayload({ action, lead, batchId });
  const verb = payload.action === 'skip' ? 'skip' : 'approve';
  const subject = `${verb}: ${payload.lead_id} ${payload.business_name}`;
  const body = [
    `Action: ${verb}`,
    `Lead: ${payload.lead_id}`,
    `Business: ${payload.business_name}`,
    `Batch: ${payload.batch_id}`,
    `Recorded at: ${new Date().toISOString()}`,
  ].join('\n');

  return buildMailto({
    email: APPROVE_NOTIFY_EMAIL,
    subject,
    body,
  });
}

function emptyStore() {
  return {};
}

export function readDecisionStore() {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(APPROVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : emptyStore();
  } catch {
    return emptyStore();
  }
}

export function getLeadDecision(store, batchId, leadId) {
  const batch = store?.[batchId];
  if (!batch || typeof batch !== 'object') return null;
  const entry = batch[leadId];
  if (!entry || (entry.action !== 'approve' && entry.action !== 'skip')) {
    return null;
  }
  return entry;
}

export function storeLeadDecision({ batchId, leadId, action }) {
  if (typeof window === 'undefined') return readDecisionStore();
  const store = readDecisionStore();
  const batchKey = sanitizeText(batchId, 80);
  const id = sanitizeText(leadId, 80);
  if (!batchKey || !id) return store;
  if (action !== 'approve' && action !== 'skip') return store;

  const batch = {
    ...(store[batchKey] && typeof store[batchKey] === 'object'
      ? store[batchKey]
      : {}),
    [id]: { action, at: new Date().toISOString() },
  };

  const next = { ...store, [batchKey]: batch };
  try {
    window.localStorage.setItem(APPROVE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — UI still proceeds.
  }
  return next;
}

export function readSessionToken() {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(APPROVE_SESSION_KEY) || '';
  } catch {
    return '';
  }
}

export function writeSessionToken(token) {
  if (typeof window === 'undefined') return '';
  const value = typeof token === 'string' ? token.trim() : '';
  try {
    if (value) window.sessionStorage.setItem(APPROVE_SESSION_KEY, value);
    else window.sessionStorage.removeItem(APPROVE_SESSION_KEY);
  } catch {
    // Private mode / quota.
  }
  return value;
}

export function clearSessionToken() {
  writeSessionToken('');
}

export function readDeviceEnrolled() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(APPROVE_ENROLLED_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeDeviceEnrolled(enrolled) {
  if (typeof window === 'undefined') return;
  try {
    if (enrolled) window.localStorage.setItem(APPROVE_ENROLLED_KEY, '1');
    else window.localStorage.removeItem(APPROVE_ENROLLED_KEY);
  } catch {
    // Private mode / quota.
  }
}

export function extractSessionToken(data) {
  if (!data || typeof data !== 'object') return '';
  const token =
    data.session_token ||
    data.sessionToken ||
    data.token ||
    data.access_token ||
    '';
  return typeof token === 'string' ? token.trim() : '';
}

export function sessionHeaders(token, { json = true } = {}) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  const value = typeof token === 'string' ? token.trim() : '';
  if (value) {
    headers.Authorization = `Bearer ${value}`;
    headers['X-Session-Token'] = value;
  }
  return headers;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function proxyResponse(response, data) {
  const proxyError =
    data && typeof data.error === 'string' ? data.error.trim() : '';
  return {
    ok: response.ok,
    status: response.status,
    data,
    unauthorized: response.status === 401 || response.status === 403,
    reason: response.ok ? undefined : proxyError || `http-${response.status}`,
  };
}

export async function getApprovalJson(path, token) {
  const url = getApprovalProxyPath(path);
  if (!url) {
    return { ok: false, reason: 'proxy-not-configured' };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: sessionHeaders(token, { json: false }),
    });
    const data = await parseJsonSafe(response);
    return proxyResponse(response, data);
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function postApprovalJson(path, body, token) {
  const url = getApprovalProxyPath(path);
  if (!url) {
    return { ok: false, reason: 'proxy-not-configured' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: sessionHeaders(token, { json: true }),
      body: JSON.stringify(body ?? {}),
    });
    const data = await parseJsonSafe(response);
    return proxyResponse(response, data);
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export function isRegistrationAvailable(health) {
  if (!health || typeof health !== 'object') return true;
  if (health.registration_open === false) return false;
  const count = Number(health.credential_count);
  const max = Number(health.max_credentials);
  if (Number.isFinite(count) && Number.isFinite(max) && count >= max) {
    return false;
  }
  return true;
}

function looksLikeHealth(data) {
  return Boolean(
    data &&
      typeof data === 'object' &&
      (typeof data.registration_open === 'boolean' ||
        Number.isFinite(Number(data.credential_count)) ||
        Number.isFinite(Number(data.max_credentials)) ||
        data.webauthn === true),
  );
}

export function parseEnrollmentHealth(data) {
  const count = Number(data?.credential_count);
  const max = Number(data?.max_credentials);
  return {
    registrationAvailable: isRegistrationAvailable(data),
    registrationOpen: data?.registration_open !== false,
    credentialCount: Number.isFinite(count) ? count : null,
    maxCredentials: Number.isFinite(max) ? max : null,
  };
}

export async function fetchEnrollmentStatus() {
  const fromHealth = await getApprovalJson('health');
  if (fromHealth.ok && looksLikeHealth(fromHealth.data)) {
    return {
      ok: true,
      source: 'health',
      ...parseEnrollmentHealth(fromHealth.data),
      data: fromHealth.data,
    };
  }

  const fromRoot = await getApprovalJson('');
  if (fromRoot.ok && looksLikeHealth(fromRoot.data)) {
    return {
      ok: true,
      source: 'root',
      ...parseEnrollmentHealth(fromRoot.data),
      data: fromRoot.data,
    };
  }

  const options = await postApprovalJson('webauthn/register/options', {});
  if (options.status === 403) {
    return {
      ok: true,
      source: 'register-options',
      registrationAvailable: false,
      registrationOpen: false,
      credentialCount: null,
      maxCredentials: null,
      reason: options.reason,
    };
  }

  return {
    ok: false,
    source: 'unknown',
    registrationAvailable: true,
    registrationOpen: true,
    credentialCount: null,
    maxCredentials: null,
    reason: fromHealth.reason || fromRoot.reason || options.reason,
  };
}

export function sessionInvalidKind(result) {
  if (!result) return '';
  const error = String(
    result.reason || result.error || result.data?.error || '',
  );
  const flagged =
    Boolean(result.unauthorized) ||
    result.status === 401 ||
    result.status === 403 ||
    /batch_changed/i.test(error) ||
    /^unauthorized$/i.test(error);
  if (!flagged) return '';
  if (/batch_changed/i.test(error)) return 'batch_changed';
  return 'unauthorized';
}

export function sessionInvalidMessage(kind) {
  if (kind === 'batch_changed') {
    return 'This batch changed. Unlock with Face ID / Touch ID to continue.';
  }
  return 'Unlock with Face ID / Touch ID to continue.';
}

export function isSessionInvalid(result) {
  return Boolean(sessionInvalidKind(result));
}

export function normalizeBatch(data) {
  if (!data || typeof data !== 'object') return null;
  const raw = Array.isArray(data.leads)
    ? data
    : data.batch && typeof data.batch === 'object'
      ? data.batch
      : null;
  if (!raw) return null;
  return {
    ...raw,
    batch_id: raw.batch_id || raw.batchId || '',
    leads: Array.isArray(raw.leads) ? raw.leads : [],
  };
}

export function assertPrivateBatchUrl(url) {
  const value = String(url || '');
  if (!value) {
    throw new Error('missing-batch-url');
  }
  if (/\/approve\/batch\.json(\?|$)/i.test(value)) {
    throw new Error('refusing-public-batch');
  }
  const proxy = getApprovalProxyUrl();
  if (proxy && !value.startsWith(`${proxy}/`)) {
    throw new Error('refusing-non-proxy-batch');
  }
  return value;
}

export async function fetchAuthenticatedBatch(token) {
  const url = getApprovalBatchEndpoint();
  if (!url) {
    return { ok: false, reason: 'proxy-not-configured' };
  }
  if (!token) {
    return { ok: false, reason: 'no-session', unauthorized: true };
  }

  try {
    assertPrivateBatchUrl(url);
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: sessionHeaders(token, { json: false }),
    });
    const data = await parseJsonSafe(response);
    if (response.status === 401 || response.status === 403) {
      const proxyError =
        data && typeof data.error === 'string' ? data.error.trim() : '';
      return {
        ok: false,
        status: response.status,
        unauthorized: true,
        data,
        reason: proxyError || 'unauthorized',
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data,
        reason: `http-${response.status}`,
      };
    }
    const batch = normalizeBatch(data);
    if (!batch) {
      return { ok: false, status: response.status, reason: 'invalid-batch' };
    }
    return { ok: true, status: response.status, batch };
  } catch (error) {
    if (error?.message === 'refusing-public-batch') {
      return { ok: false, reason: 'refusing-public-batch' };
    }
    return { ok: false, reason: 'network' };
  }
}

function verifyPayload(credential, optionsResponse) {
  const extra = {};
  if (optionsResponse?.session_id) extra.session_id = optionsResponse.session_id;
  if (optionsResponse?.challenge_id) {
    extra.challenge_id = optionsResponse.challenge_id;
  }
  return { ...credential, ...extra };
}

export async function registerPasskey() {
  const optionsRes = await postApprovalJson('webauthn/register/options', {});
  if (!optionsRes.ok) {
    return {
      ok: false,
      reason: optionsRes.reason || 'register-options-failed',
      status: optionsRes.status,
    };
  }
  if (!unwrapPublicKeyOptions(optionsRes.data)) {
    return { ok: false, reason: 'webauthn-options-missing-challenge' };
  }

  const credential = await createCredential(optionsRes.data);
  const verifyRes = await postApprovalJson(
    'webauthn/register/verify',
    verifyPayload(credential, optionsRes.data),
  );
  if (!verifyRes.ok) {
    return {
      ok: false,
      reason: verifyRes.reason || 'register-verify-failed',
      status: verifyRes.status,
    };
  }

  const token = extractSessionToken(verifyRes.data);
  return { ok: true, token, data: verifyRes.data, enrolled: true };
}

export async function loginPasskey() {
  const optionsRes = await postApprovalJson('webauthn/login/options', {});
  if (!optionsRes.ok) {
    return {
      ok: false,
      reason: optionsRes.reason || 'login-options-failed',
      status: optionsRes.status,
    };
  }
  if (!unwrapPublicKeyOptions(optionsRes.data)) {
    return { ok: false, reason: 'webauthn-options-missing-challenge' };
  }

  const credential = await getCredential(optionsRes.data);
  const verifyRes = await postApprovalJson(
    'webauthn/login/verify',
    verifyPayload(credential, optionsRes.data),
  );
  if (!verifyRes.ok) {
    return {
      ok: false,
      reason: verifyRes.reason || 'login-verify-failed',
      status: verifyRes.status,
      unauthorized: verifyRes.unauthorized,
    };
  }

  const token = extractSessionToken(verifyRes.data);
  if (!token) {
    return { ok: false, reason: 'missing-session-token' };
  }
  return { ok: true, token, data: verifyRes.data };
}

export async function enrollDevice() {
  const registered = await registerPasskey();
  if (!registered.ok) return registered;
  writeDeviceEnrolled(true);
  if (registered.token) {
    writeSessionToken(registered.token);
    return registered;
  }
  const loggedIn = await loginPasskey();
  if (loggedIn.ok && loggedIn.token) {
    writeSessionToken(loggedIn.token);
  }
  return { ...loggedIn, enrolled: true };
}

export async function unlockDevice() {
  const loggedIn = await loginPasskey();
  if (loggedIn.ok && loggedIn.token) {
    writeDeviceEnrolled(true);
    writeSessionToken(loggedIn.token);
  }
  return loggedIn;
}

export function proxyAuthErrorMessage(result) {
  if (!result) return 'Could not reach the approval proxy. Try again.';
  const detail = String(result.reason || result.data?.error || '');
  if (result.reason === 'proxy-not-configured') {
    return 'Approval proxy is not configured.';
  }
  if (result.reason === 'missing-session-token') {
    return 'Passkey worked, but the proxy did not return a session. Try Unlock again.';
  }
  if (result.reason === 'webauthn-options-missing-challenge') {
    return 'The passkey service did not return a challenge. Try again in a moment.';
  }
  if (/batch_changed/i.test(detail)) {
    return sessionInvalidMessage('batch_changed');
  }
  if (/no credentials registered/i.test(detail)) {
    return 'No passkey is registered yet. Tap Register this device, then Face ID / Touch ID.';
  }
  if (/missing or expired challenge/i.test(detail)) {
    return 'Passkey challenge expired. Tap Unlock (or Register) and try again.';
  }
  if (/attestation failed/i.test(detail) || /assertion failed/i.test(detail)) {
    return 'Could not verify this device. Try Register this device again.';
  }
  if (result.status === 404) {
    return 'Passkey service is not ready on the proxy yet. Try again in a moment.';
  }
  if (
    result.status === 403 &&
    (/register/i.test(detail) ||
      /registration/i.test(detail) ||
      /full/i.test(detail) ||
      /closed/i.test(detail))
  ) {
    return 'Enrollment is full. Unlock with Face ID / Touch ID on Allen\'s enrolled phone.';
  }
  if (result.unauthorized || /unauthorized/i.test(detail)) {
    return 'This device is not authorized. Unlock with Face ID / Touch ID on Allen\'s enrolled phone.';
  }
  if (result.reason === 'network') {
    return 'Could not reach the approval proxy. Try again.';
  }
  return 'Could not complete Face ID / Touch ID. Try again.';
}

export async function postDecisionToProxy(payload, token) {
  const endpoint = getApprovalProxyEndpoint();
  if (!endpoint) {
    return { ok: false, reason: 'proxy-not-configured' };
  }
  if (!token) {
    return { ok: false, reason: 'no-session', unauthorized: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: sessionHeaders(token, { json: true }),
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafe(response);
    return proxyResponse(response, data);
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export function openMailto(href) {
  if (typeof window === 'undefined' || !href) return;
  window.location.href = href;
}

export async function submitLeadDecision({ action, lead, batch, token }) {
  if (action !== 'approve' && action !== 'skip') {
    return {
      store: readDecisionStore(),
      recordedLocally: false,
      submittedToProxy: false,
      usedMailto: false,
      mailtoHref: null,
      reason: 'bad-action',
    };
  }

  const batchId = sanitizeText(batch?.batch_id, 80);
  const payload = buildDecisionPayload({ action, lead, batchId });
  const sessionToken = token || readSessionToken();
  const proxyConfigured = isApprovalProxyConfigured();

  if (!proxyConfigured) {
    const store = storeLeadDecision({
      batchId,
      leadId: lead?.id,
      action,
    });
    return {
      store,
      recordedLocally: true,
      submittedToProxy: false,
      usedMailto: true,
      mailtoHref: buildDecisionMailto({ action, lead, batchId }),
      reason: 'proxy-not-configured',
    };
  }

  const submission = await postDecisionToProxy(payload, sessionToken);
  if (!submission.ok) {
    return {
      store: readDecisionStore(),
      recordedLocally: false,
      submittedToProxy: false,
      usedMailto: false,
      mailtoHref: null,
      unauthorized: Boolean(submission.unauthorized),
      reason: submission.reason || 'proxy-failed',
      data: submission.data,
    };
  }

  const store = storeLeadDecision({
    batchId,
    leadId: lead?.id,
    action,
  });
  return {
    store,
    recordedLocally: true,
    submittedToProxy: true,
    usedMailto: false,
    mailtoHref: null,
  };
}
