# Mohammed Rifky portfolio

An existing Next.js portfolio using Tailwind CSS 4 and Motion for React.

## Preview and checks

```sh
npm run lint
npm run build
npm run start
```

Open http://localhost:3000 for the production preview. Stop with Ctrl+C.
For editing with hot reload, use `npm run dev`.

## Browser branding and sharing

Native App Router metadata provides the `mr.` browser icons and a 1200 × 630 charcoal/silver social preview at `/opengraph-image`. Open Graph and X use the same preview. Person JSON-LD uses the facts in `data/portfolio.ts`.

Set `SITE_URL` to the final public URL in the deployment environment **before building**. This supplies absolute sharing URLs, the metadata base, canonical URL, and structured-data URL. Until configured, no production domain or canonical is assumed; Next.js may resolve sharing image URLs against its local/preview fallback. `.env.example` lists the setting.

## Personal assets

Add the real files at:

- `public/images/rifky-profile.png`
- `public/Mohammed-Rifky-CV.pdf`

The portrait uses a designed monogram fallback. The CV checks availability before downloading and offers an email request if unavailable. Project artwork is schematic concept artwork, not actual product screenshots.

## Content and contact

Portfolio facts, links, education, projects, skills and certifications live in `data/portfolio.ts`. Contact sends a notification through the server-side Gmail SMTP endpoint. See [contact email setup](docs/contact-email.md) for credentials, testing, and serverless throttling limitations.

## Assistant boundary

The assistant is deterministic and local, not an LLM. `lib/assistant.ts` contains portfolio-grounded responses and a resilient client transport. `app/api/chat/route.ts` accepts a bounded, validated same-origin request and returns a local response. No API key is required.

A future LLM adapter belongs only in the server route (or a server-only module), with secrets from server environment variables. Before enabling paid provider calls, add deployment-appropriate rate limits and timeouts, ground the prompt in the centralized portfolio data, and keep local responses for missing configuration and provider failures. Never use `NEXT_PUBLIC_*` for secrets.

## Verification

With the production server running, execute:

```sh
node scripts/check-production.mjs
```

Pass another base URL as the first argument if needed. The checks exercise portfolio content, repository safety, assistant topics, invalid requests, and unavailable assets. Responsive layouts and overlay focus paths also require browser review before deployment.
