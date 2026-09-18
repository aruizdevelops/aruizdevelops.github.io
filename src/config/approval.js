/**
 * Public approval proxy base URL only.
 *
 * The GitHub Pages client POSTs JSON to `${APPROVAL_PROXY_URL}/decision`.
 * Never put a Cursor automation sender key or Authorization header in this
 * file, env, or any other client bundle.
 */
export const APPROVAL_PROXY_URL =
  process.env.NEXT_PUBLIC_APPROVAL_PROXY_URL ||
  'https://authorized-philip-mechanics-rick.trycloudflare.com';
