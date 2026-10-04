# Contact email setup

The existing form posts JSON to `/api/contact`. The Node.js route validates all
fields and waits for Gmail SMTP acceptance before returning success. SMTP
acceptance confirms sending; it cannot prove inbox placement, exclude later
bounces, or confirm that the owner read the email.

## Configure locally

1. Sign into the Google account for `rifky15648@gmail.com` and enable 2-Step
   Verification: https://myaccount.google.com/security.
2. Open https://myaccount.google.com/apppasswords, create an App Password named
   `Rifky Portfolio`, and copy Google's generated password privately.
3. Add these variables to the existing Git-ignored `.env.local` without replacing
   any unrelated settings:

   ```dotenv
   GMAIL_USER=rifky15648@gmail.com
   GMAIL_APP_PASSWORD=<paste-your-generated-app-password-here>
   CONTACT_TO_EMAIL=rifky15648@gmail.com
   ```

4. Restart `npm run dev`. Submit a test through the contact form. Check the inbox
   and spam folder, then press Reply and confirm the visitor is the recipient.

Never use the normal Google account password. Never put these variables in
`NEXT_PUBLIC_*`, Git, screenshots, logs, or chat. If App Passwords are unavailable,
check Google's account restrictions and 2-Step Verification settings:
https://support.google.com/accounts/answer/185833.

When the owner later publishes this upgrade, add `GMAIL_USER`,
`GMAIL_APP_PASSWORD`, and `CONTACT_TO_EMAIL` to Vercel's Production environment
and rebuild/redeploy. No Vercel settings are changed by this local implementation.

## Behavior and protection

- Limits: name 100, email 254, subject 150, message 2000 characters; total JSON
  body 16 KiB. Blank values, invalid email addresses, header-injection controls,
  non-JSON requests, and cross-origin browser requests are rejected.
- The invisible, keyboard-skipped `website` honeypot rejects populated values
  without sending mail or claiming success.
- Best-effort throttle: 3 valid, configured send attempts per client address per
  10 minutes, for each warm server instance. Failed SMTP attempts also count.
  The map is bounded to 1000 active addresses, expires entries, and returns 429
  with `Retry-After` when blocked.
- This is **not durable global rate limiting on Vercel**: cold starts reset it,
  concurrent instances have separate maps, and forwarding headers can be spoofed
  when the route is called outside a trusted proxy. Durable throttling requires
  a shared store/service or managed Vercel firewall limits. None is added here.
- Gmail sends from the authenticated account to the server-configured inbox.
  The validated visitor email is `Reply-To`, never the SMTP sender or destination.
  HTML is escaped; plain text is included. No attachments, tracking, file reads,
  URL reads, or SMTP debug logging are enabled.
- Missing credentials return controlled 503 errors; SMTP failures or a rejected
  recipient return 502. Internal errors and credential values are never returned.
- The form prevents concurrent sends, retains fields on failure, and clears all
  fields only after an HTTP success with `success: true`.

## Offline verification

```sh
node scripts/check-contact.mjs
npm run lint
npm run build
```

The contact checker uses mock SMTP and placeholder environment values in memory.
It never connects to Gmail or sends email. Real end-to-end delivery must be tested
after the owner supplies credentials privately. Unsupported methods receive
Next.js's standard 405 response.
