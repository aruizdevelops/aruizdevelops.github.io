# Lead approvals

Allen reviews Scout batches on his phone at a public static page on this GitHub Pages site.

## Public URL

```
https://aruizdevelops.github.io/approve/
```

Email Allen that link when a batch is ready. The page is an internal review UI (`noindex`). It is not linked from the public portfolio nav.

## Security: never put the sender key on GitHub Pages

This site is a **static export**. Anything in the client bundle, `public/`, or committed files is public.

**Do not** put any of these in this repo, env vars that Next inlines, `batch.json`, or browser JS:

- Cursor automation **sender key**
- `Authorization` headers
- The upstream Cursor webhook URL (the proxy calls that server-side)

The browser only POSTs JSON to a **public proxy** that CoS operates. The proxy attaches the secret and forwards to Cursor.

## How Scout publishes a batch

Scout **regenerates** `public/approve/batch.json` per batch and ships it with the GitHub Pages deploy.

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

On **Accept** or **Skip**:

1. The page POSTs JSON to:

   ```
   ${APPROVAL_PROXY_URL}/decision
   ```

   Production default (committed in `src/config/approval.js`):

   ```
   https://authorized-philip-mechanics-rick.trycloudflare.com/decision
   ```

   Headers: `Content-Type: application/json` only. **No Authorization header.**

2. On a successful proxy POST, the card is marked done in `localStorage` (`tcs-lead-approvals`, keyed by `batch_id` + lead `id`). That is device-only.

3. If `APPROVAL_PROXY_URL` were ever empty, the page would show **Proxy not configured** and Accept/Skip would open a mailto to `allen.s.ruiz1@gmail.com` whose subject encodes `approve:` / `skip:` + lead id + name. Production builds use the committed Cloudflare URL, so this fallback should not appear.

4. If the proxy URL is set but the POST fails, the card stays open so Allen can retry. It does **not** fall back to mailto (that would hide a broken proxy).

POST body:

```json
{
  "action": "approve",
  "lead_id": "lead-001",
  "business_name": "Example Barbershop",
  "batch_id": "2026-09-19"
}
```

`action` is `approve` or `skip`. `business_name` and `batch_id` are included when present.

Mailto subject (only if the proxy URL is empty):

```
approve: lead-001 Example Barbershop
skip: lead-001 Example Barbershop
```

The public config is `src/config/approval.js`:

```js
export const APPROVAL_PROXY_URL =
  process.env.NEXT_PUBLIC_APPROVAL_PROXY_URL ||
  'https://authorized-philip-mechanics-rick.trycloudflare.com';
```

## CoS: wire the proxy

The live proxy is the Cloudflare tunnel above. It must:

- Allow CORS from `https://aruizdevelops.github.io`
- Accept `POST /decision` with the JSON body above (no browser auth)
- Forward that body to the **upstream** Cursor automation webhook, adding the sender key **only on the server** (never in this repo):

  `https://api2.cursor.sh/automations/webhook/ed64d389-5927-5f88-ac53-ed47e40daeaf`

Override the base URL with GitHub Actions variable `APPROVAL_PROXY_URL` if the tunnel host changes. Deploy inlines it as `NEXT_PUBLIC_APPROVAL_PROXY_URL`.

Locally:

```
NEXT_PUBLIC_APPROVAL_PROXY_URL=https://authorized-philip-mechanics-rick.trycloudflare.com
```
