# Texas Craft Sites Portfolio

Public portfolio for [Texas Craft Sites](https://aruizdevelops.github.io), the web and mobile work of Allen Ruiz.

This is a Next.js App Router site with `output: 'export'` and `trailingSlash: true`, deployed to GitHub Pages. Shared UI and theming come from the internal package `@bluebonnet-tech/core` (sibling checkout `../bluebonnet-tech-core`).

## Scripts

```bash
npm install
npm run dev
npm run build
```

`npm run build` writes a static site to `out/`. GitHub Pages deploy is `.github/workflows/deploy.yml`.

## Outreach unsubscribes

Cold-outreach recipients can opt out at:

```
https://aruizdevelops.github.io/unsubscribe/?e={email}&b={optional-business-name}
```

**Outreach must not email any address that has confirmed unsubscribe.** Treat Formspree/webhook submissions and `Unsubscribe: {email}` messages to `ruiz.allen.development@gmail.com` as a hard suppressions list.

See [UNSUBSCRIBE.md](./UNSUBSCRIBE.md) for link format, recording behavior, and how to wire `NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT` in production.

## Lead approvals

Allen reviews Scout batches on his phone at:

```
https://aruizdevelops.github.io/approve/
```

The page is passkey-gated. First visit (while enrollment is open): **Register this device** + Face ID / Touch ID. Later visits, or when enrollment is full: **Unlock with Face ID / Touch ID** only. After WebAuthn login, **Email** loads authenticated `GET {APPROVAL_PROXY_URL}/batch` filtered to public-email shops. **Call** loads authenticated `GET {APPROVAL_PROXY_URL}/call-queue` with the same session headers — not a client-side `/batch` filter. `public/approve/batch.json` is an empty placeholder — not the source of truth.

Email Accept/Skip POSTs `{action, lead_id, business_name, batch_id}`. Call POSTs `{action, lead_id, business_name, batch_id, callback_at?}` with `interested` | `callback` | `no_answer` | `bad_number` | `remove`. Session headers on both. The Cursor sender key never ships in this repo.

See [APPROVE.md](./APPROVE.md) for enroll steps, the JSON shape, POST body, and how decisions are recorded.
