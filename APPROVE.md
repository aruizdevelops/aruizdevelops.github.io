# Lead approvals

Allen reviews Scout batches on his phone at a public static page on this GitHub Pages site.

## Public URL

```
https://aruizdevelops.github.io/approve/
```

Email Allen that link when a batch is ready. The page is an internal review UI (`noindex`). It is not linked from the public portfolio nav.

## How Scout publishes a batch

This site is a static export (`output: 'export'`), so there is no server of our own. Scout **regenerates** `public/approve/batch.json` per batch and ships it with the GitHub Pages deploy (commit + push, or overwrite the file on `main` and let deploy run).

Shape:

```json
{
  "batch_id": "2026-09-19",
  "generated_at": "2026-09-19T12:00:00.000Z",
  "webhook_url": "",
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
| `webhook_url` | no | Public POST URL for this batch. Empty string uses the build-time fallback, then mailto. |
| `region` | no | Header subtitle bit, e.g. `Austin TX ~30mi`. |
| `leads` | yes | Cards, in order. |

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

On **Accept** or **Skip** the page:

1. **Marks the card done** in `localStorage` under `tcs-lead-approvals` (keyed by `batch_id` + lead `id`). That is device-only.
2. **POSTs JSON** to `batch.webhook_url` when that string is a public `http(s)` URL.
3. Else POSTs to `NEXT_PUBLIC_APPROVAL_WEBHOOK_URL` when that env var was baked in at **build** time.
4. **Falls back** to a prefilled mailto to `allen.s.ruiz1@gmail.com` when no webhook is set or the POST fails.

POST body (no secrets):

```json
{
  "action": "approve",
  "lead_id": "lead-001",
  "business_name": "Example Barbershop",
  "batch_id": "2026-09-19"
}
```

`action` is `approve` or `skip`.

Mailto subject:

```
approve: lead-001 Example Barbershop
skip: lead-001 Example Barbershop
```

## CoS: set the webhook

Chief of Staff sets `webhook_url` on the batch JSON to a CORS-friendly public endpoint (Formspree, Google Apps Script `doPost`, etc.). That value is **not a secret** — it is shipped in static JSON.

To use one URL for every batch instead, set the GitHub Actions **variable** `APPROVAL_WEBHOOK_URL` on this repo. Deploy inlines it as `NEXT_PUBLIC_APPROVAL_WEBHOOK_URL`. Per-batch `webhook_url` still wins when present.

Until a webhook is set, Accept / Skip opens the mailto fallback so Allen still gets the decision.

Locally:

```
NEXT_PUBLIC_APPROVAL_WEBHOOK_URL=https://formspree.io/f/xxxxxxxx
```
