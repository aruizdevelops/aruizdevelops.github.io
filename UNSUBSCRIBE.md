# Outreach unsubscribes

Cold-outreach recipients can one-click opt out at a public static page on this GitHub Pages site.

## Public URL

```
https://aruizdevelops.github.io/unsubscribe/?e={url-encoded-email}&b={optional-business-name}
```

| Param | Required | Meaning |
| --- | --- | --- |
| `e` | yes | Recipient email |
| `b` | no | Business name (display / metadata only) |

Example:

```
https://aruizdevelops.github.io/unsubscribe/?e=owner%40example.com&b=Example%20Cafe
```

## How a confirmation is recorded

This site is a static export (`output: 'export'`), so there is no server of our own. On **Confirm unsubscribe** the page:

1. **POSTs JSON** to `NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT` when that env var is set at build time (Formspree, Google Apps Script, or any CORS-friendly webhook).
2. **Always stores** a local confirmation in `localStorage` under `tcs-outreach-unsubscribed`.
3. **Falls back** to a prefilled mailto to `ruiz.allen.development@gmail.com` with subject `Unsubscribe: {email}` when no endpoint is configured or the POST fails.

Local storage is device-only. Mailto depends on the recipient sending the drafted message. **Production should wire `NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT` to a durable suppressions list** (Formspree inbox, Apps Script sheet, CRM webhook, etc.).

Do **not** log unsubscribes as public GitHub issues. That would publish recipient emails.

## How Outreach should treat confirmed unsubscribes

Treat any of these as a **hard suppression** for the Texas Craft Sites outreach list:

- A successful POST to the unsubscribe endpoint (Formspree submission, sheet row, webhook payload)
- An inbound email whose subject is `Unsubscribe: {email}`
- Any address the operator has already marked suppressed

Rules:

- **Never** send further Texas Craft Sites cold outreach to a suppressed address.
- Match on **normalized email** (trim + lowercase). The optional business name (`b`) is metadata only; suppress the email even if the business name differs or is missing.
- The click on **Confirm unsubscribe** is the opt-out. Do not wait for a reply.
- Apply the suppression to all Texas Craft Sites outreach sequences, not only the campaign that sent the link.
- Keep the suppression indefinitely unless the person later asks to be contacted.

## Wiring a durable endpoint

1. Create a Formspree form (or Google Apps Script `doPost` / other webhook) that accepts JSON:

   ```json
   {
     "email": "owner@example.com",
     "business": "Example Cafe",
     "source": "texas-craft-sites-unsubscribe",
     "_subject": "Unsubscribe: owner@example.com",
     "message": "Please remove owner@example.com from the Texas Craft Sites outreach list. Business: Example Cafe."
   }
   ```

2. Set the GitHub Actions **variable** `UNSUBSCRIBE_ENDPOINT` on this repo to the public form URL, for example `https://formspree.io/f/xxxxxxxx`. That value is inlined into the static bundle as `NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT` (it is not a secret).
3. Redeploy. Until that variable is set, the page uses the mailto + local confirmation fallback.

Locally you can put the same URL in `.env.local`:

```
NEXT_PUBLIC_UNSUBSCRIBE_ENDPOINT=https://formspree.io/f/xxxxxxxx
```
