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

Scout regenerates `public/approve/batch.json` per batch. Accept/Skip POST JSON to `https://authorized-philip-mechanics-rick.trycloudflare.com/decision` (override with `NEXT_PUBLIC_APPROVAL_PROXY_URL`) with **no Authorization header**. The Cursor sender key never ships in this repo.

See [APPROVE.md](./APPROVE.md) for the JSON shape, POST body, and how decisions are recorded.
