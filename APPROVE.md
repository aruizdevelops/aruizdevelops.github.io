# Lead approvals

Allen reviews Scout batches on his phone at a public static page on this GitHub Pages site. The page URL is public; **lead cards and Accept/Skip are not.** A WebAuthn / passkey gate unlocks the UI on Allen’s registered device only.

## Public URL

```
https://aruizdevelops.github.io/approve/
```

Email Allen that link when a batch is ready. The page is an internal review UI (`noindex`). It is not linked from the public portfolio nav.

## Allen: first-time enroll

1. Open **https://aruizdevelops.github.io/approve/** on the phone that should be allowed.
2. Tap **Register this device**.
3. Complete Face ID / Touch ID (platform authenticator).
4. If the page still shows the lock screen, tap **Unlock with Face ID / Touch ID**.
5. Lead cards load from the proxy. Accept / Skip as usual.

Later visits: tap **Unlock with Face ID / Touch ID**. The lock screen calls `GET {APPROVAL_PROXY_URL}/health`. If `registration_open` is `false` or `credential_count >= max_credentials`, **Register this device** is hidden — only Unlock is shown. Do not publish leads on GitHub Pages.

If `GET /batch` or `POST /decision` returns **401** with `error: "batch_changed"` or `unauthorized`, the page clears the session token, returns to the lock screen, and prompts **Unlock with Face ID / Touch ID**. It does not auto-register.

## Security: static GitHub Pages cannot hide secrets or lead lists

This site is a **static export**. Anything in the client bundle, `public/`, or committed files is public.

**Do not** put any of these in this repo, env vars that Next inlines, `public/approve/batch.json`, or browser JS:

- Cursor automation **sender key**
- The upstream Cursor webhook URL (the proxy calls that server-side)
- The real lead list

`public/approve/batch.json` is an empty placeholder so the previously published list is overwritten. The client **does not fetch it**. After a successful WebAuthn login, it loads:

```
GET ${APPROVAL_PROXY_URL}/batch
Authorization: Bearer <session_token>
X-Session-Token: <session_token>
```

Never ship a half-open gate that renders lead cards from the static file.

Relying party for passkeys:

- RP ID: `aruizdevelops.github.io`
- Origin: `https://aruizdevelops.github.io`

## How Scout publishes a batch

Scout publishes the batch **to the approval proxy** (not to this repo). The proxy serves it on authenticated `GET /batch`.

Shape:

```json
{
  "batch_id": "2026-09-19",
  "generated_at": "2026-09-19T12:00:00.000Z",
  "region": "Austin TX ~30mi",
  "leads": [
    {
      "id": "lead-001",
      "business_name": "Example Barbershop",
      "niche": "barbershop",
      "city": "Austin",
      "phone": "512-555-0100",
      "email": "hello@example.com",
      "why": "plain shop-owner english",
      "website_url": "https://example.com",
      "maps_url": "https://maps.google.com/?q=Example",
      "status": "ready_for_outreach"
    }
  ]
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `batch_id` | yes | Groups decisions in `localStorage`. New batch id = fresh review. |
| `generated_at` | yes | ISO timestamp. Shown in the header as a date. |
| `region` | no | Header subtitle bit, e.g. `Austin TX ~30mi`. |
| `leads` | yes | Cards, in order. |

If a `webhook_url` field is present, the **page ignores it**. Do not put secrets or the Cursor webhook there.

Each lead:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Stable id for POST + localStorage (`lead-001`). |
| `business_name` | yes | Card title. |
| `niche` | yes | Shown as `niche · city`. |
| `city` | yes | Shown as `niche · city`. |
| `phone` | no | Shown if present; `tel:` link. |
| `email` | no | Shown next to phone if present. |
| `why` | yes | Plain shop-owner English under **Why we're contacting**. |
| `website_url` | no | **Site** verify pill. |
| `maps_url` | no | **Maps** verify pill (a Maps search is built from name + city if omitted). |
| `status` | yes | Pill label. `ready_for_outreach` (teal) or `researching` (amber). |

The page always adds a **Google** verify pill from name + city.

## How a decision is recorded

On **Accept** or **Skip** (only after unlock):

1. The page POSTs JSON to:

   ```
   ${APPROVAL_PROXY_URL}/decision
   ```

   Production default (committed in `src/config/approval.js`):

   ```
   https://authorized-philip-mechanics-rick.trycloudflare.com/decision
   ```

   Headers: `Content-Type: application/json`, plus the WebAuthn session:

   ```
   Authorization: Bearer <session_token>
   X-Session-Token: <session_token>
   ```

   That session token is issued by `POST /webauthn/login/verify`. It is **not** a Cursor sender key.

2. Body (unchanged):

   ```json
   {
     "action": "approve",
     "lead_id": "lead-001",
     "business_name": "Example Barbershop",
     "batch_id": "2026-09-19"
   }
   ```

   `action` is `approve` or `skip`.

3. On a successful proxy POST, the card is marked done in `localStorage` (`tcs-lead-approvals`, keyed by `batch_id` + lead `id`). That is device-only.

4. If `APPROVAL_PROXY_URL` were ever empty, the lock screen stays closed (leads cannot load) and the page would show that the proxy is not configured. Production builds use the committed Cloudflare URL.

5. If the session expired or the batch changed (`401` `unauthorized` / `batch_changed`), the page clears the session and re-locks on Unlock. It does not auto-register. If the proxy POST fails for another reason, the card stays open so Allen can retry.

Mailto subject (only if the proxy URL is empty — should not appear in production):

```
approve: lead-001 Example Barbershop
skip: lead-001 Example Barbershop
```

The public config is `src/config/approval.js`.

## CoS: wire the proxy

The live proxy is the Cloudflare tunnel above. It must:

- Allow CORS from `https://aruizdevelops.github.io`
- Allow methods `GET, POST, OPTIONS`
- Allow headers `Content-Type, Authorization, X-Session-Token`
- Implement:

  | Endpoint | Auth | Role |
  | --- | --- | --- |
  | `GET /health` | no | `{ registration_open, credential_count, max_credentials }`. Lock screen hides Register when enrollment is full. |
  | `POST /webauthn/register/options` | no | Create passkey options (platform authenticator, UV required). RP ID `aruizdevelops.github.io`. `403` when enrollment is closed. |
  | `POST /webauthn/register/verify` | no | Verify attestation. First-time enroll of Allen’s device. |
  | `POST /webauthn/login/options` | no | Create assertion options. |
  | `POST /webauthn/login/verify` | no | Verify assertion. Return `{ "session_token": "..." }`. |
  | `GET /batch` | session | Return the current batch JSON. |
  | `POST /decision` | session | Accept/Skip body above; forward to Cursor **server-side** with the sender key. |

- Reject `GET /batch` and `POST /decision` without a valid session (`401` `unauthorized`, or `401` `batch_changed` when the published batch has moved on).
- Restrict passkey registration to Allen’s allowlist and cap (`max_credentials`). When full, `registration_open` is `false` and `POST /webauthn/register/options` returns `403`.

Override the base URL with GitHub Actions variable `APPROVAL_PROXY_URL` if the tunnel host changes. Deploy inlines it as `NEXT_PUBLIC_APPROVAL_PROXY_URL`.

Locally:

```
NEXT_PUBLIC_APPROVAL_PROXY_URL=https://authorized-philip-mechanics-rick.trycloudflare.com
```
