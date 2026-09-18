/**
 * Public approval proxy base URL only.
 *
 * Browser calls:
 *   POST ${APPROVAL_PROXY_URL}/webauthn/register/options
 *   POST ${APPROVAL_PROXY_URL}/webauthn/register/verify
 *   POST ${APPROVAL_PROXY_URL}/webauthn/login/options
 *   POST ${APPROVAL_PROXY_URL}/webauthn/login/verify  → { session_token }
 *   GET  ${APPROVAL_PROXY_URL}/batch                 (session required)
 *   POST ${APPROVAL_PROXY_URL}/decision              (session required)
 *
 * Session auth uses a short-lived token from WebAuthn login
 * (`Authorization: Bearer <token>` and `X-Session-Token`).
 * Never put a Cursor automation sender key or upstream webhook URL here.
 */
export const APPROVAL_PROXY_URL =
  process.env.NEXT_PUBLIC_APPROVAL_PROXY_URL ||
  'https://authorized-philip-mechanics-rick.trycloudflare.com';
