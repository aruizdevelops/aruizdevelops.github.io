import { buildMailto } from './mailto';

export const UNSUBSCRIBE_NOTIFY_EMAIL = 'ruiz.allen.development@gmail.com';
export const UNSUBSCRIBE_STORAGE_KEY = 'tcs-outreach-unsubscribed';
export const UNSUBSCRIBE_SOURCE = 'texas-craft-sites-unsubscribe';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_BUSINESS_LENGTH = 200;

export function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .slice(0, MAX_EMAIL_LENGTH);
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return email.length > 2 && EMAIL_PATTERN.test(email);
}

export function normalizeBusinessName(value) {
  if (value == null) return '';
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_BUSINESS_LENGTH);
}

export function getUnsubscribeEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT;
  if (typeof endpoint !== 'string') return '';
  return endpoint.trim();
}

export function buildUnsubscribeMailto({ email, business }) {
  const lines = [
    'Please remove this address from the Texas Craft Sites outreach list.',
    '',
    `Email: ${email}`,
  ];
  if (business) {
    lines.push(`Business: ${business}`);
  }
  lines.push(`Requested at: ${new Date().toISOString()}`);

  return buildMailto({
    email: UNSUBSCRIBE_NOTIFY_EMAIL,
    subject: `Unsubscribe: ${email}`,
    body: lines.join('\n'),
  });
}

export function buildUnsubscribePayload({ email, business }) {
  const message = business
    ? `Please remove ${email} from the Texas Craft Sites outreach list. Business: ${business}.`
    : `Please remove ${email} from the Texas Craft Sites outreach list.`;

  return {
    email,
    business: business || '',
    source: UNSUBSCRIBE_SOURCE,
    _subject: `Unsubscribe: ${email}`,
    message,
  };
}

function readStorageList() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(UNSUBSCRIBE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasLocalUnsubscribe(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return readStorageList().some((entry) => {
    if (typeof entry === 'string') return normalizeEmail(entry) === normalized;
    return normalizeEmail(entry?.email) === normalized;
  });
}

export function storeLocalUnsubscribe({ email, business }) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  const next = readStorageList().filter((entry) => {
    if (typeof entry === 'string') return normalizeEmail(entry) !== normalized;
    return normalizeEmail(entry?.email) !== normalized;
  });

  next.push({
    email: normalized,
    business: normalizeBusinessName(business),
    confirmedAt: new Date().toISOString(),
  });

  try {
    window.localStorage.setItem(UNSUBSCRIBE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — confirmation UI still proceeds.
  }
}

export async function submitUnsubscribeToEndpoint({ email, business }) {
  const endpoint = getUnsubscribeEndpoint();
  if (!endpoint) {
    return { ok: false, reason: 'no-endpoint' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildUnsubscribePayload({ email, business })),
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

export async function confirmUnsubscribe({ email, business }) {
  storeLocalUnsubscribe({ email, business });

  const submission = await submitUnsubscribeToEndpoint({ email, business });
  const usedMailto = !submission.ok;

  return {
    recordedLocally: true,
    submittedToEndpoint: submission.ok,
    usedMailto,
    mailtoHref: usedMailto ? buildUnsubscribeMailto({ email, business }) : null,
  };
}
