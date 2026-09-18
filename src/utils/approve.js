import { APPROVAL_PROXY_URL } from '../config/approval';
import { buildMailto } from './mailto';

export const APPROVE_NOTIFY_EMAIL = 'allen.s.ruiz1@gmail.com';
export const APPROVE_STORAGE_KEY = 'tcs-lead-approvals';
export const APPROVE_BATCH_URL = '/approve/batch.json';

const MAX_TEXT_LENGTH = 200;
const ALLOWED_ACTIONS = new Set(['approve', 'skip', 'ping']);

export { APPROVAL_PROXY_URL };

export function getApprovalProxyUrl() {
  const raw =
    typeof APPROVAL_PROXY_URL === 'string' ? APPROVAL_PROXY_URL.trim() : '';
  const base = raw.replace(/\/+$/, '');
  return isHttpUrl(base) ? base : '';
}

export function getApprovalProxyEndpoint() {
  const base = getApprovalProxyUrl();
  return base ? `${base}/decision` : '';
}

export function isApprovalProxyConfigured() {
  return Boolean(getApprovalProxyEndpoint());
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

export async function postDecisionToProxy(payload) {
  const endpoint = getApprovalProxyEndpoint();
  if (!endpoint) {
    return { ok: false, reason: 'proxy-not-configured' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export function openMailto(href) {
  if (typeof window === 'undefined' || !href) return;
  window.location.href = href;
}

export async function submitLeadDecision({ action, lead, batch }) {
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

  const submission = await postDecisionToProxy(payload);
  if (!submission.ok) {
    return {
      store: readDecisionStore(),
      recordedLocally: false,
      submittedToProxy: false,
      usedMailto: false,
      mailtoHref: null,
      reason: submission.reason || 'proxy-failed',
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
