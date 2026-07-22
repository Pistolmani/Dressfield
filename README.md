# Dressfield

E-commerce site for a Georgian embroidery business. Customers browse pre-made embroidered products or order custom embroidery by uploading a design and previewing it live on the product. Checkout runs through Bank of Georgia iPay.

This repo is the Next.js frontend. The backend lives at [Pistolmani/Dressfield-api](https://github.com/Pistolmani/Dressfield-api).

## Tech stack

- **Frontend:** Next.js 16 + React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend:** ASP.NET Core 8 Web API — [separate repo](https://github.com/Pistolmani/Dressfield-api)
- **Database:** MySQL 8 + Entity Framework Core
- **Payments:** Bank of Georgia iPay (redirect-based)
- **Analytics:** Meta Pixel
- **Hosting:** Static export → Hostinger (frontend), Azure App Service (API)
- **Language:** Georgian (MVP)

## Local development

```bash
npm install
npm run dev
```

Opens on [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build          # production build (static export)
npm run serve:static   # serve the exported ./out locally
npm test               # vitest
npm run lint
```

## Deploy

Hostinger is shared hosting with no Node.js runtime, so the site ships as a static export.

```bash
npm run deploy:hostinger   # clean → build → prepare → upload
```

Individual steps live in `Dressfield.web/scripts/` (`prepare-hostinger-deploy.mjs`, `upload-hostinger.mjs`).

## Constraints worth knowing

- Static export only — no SSR, no ISR, no Next.js API routes, no `next/image`, no middleware.
- Payment flow is redirect-based (user leaves for BOG, returns via callback); status updates come through webhooks handled by the API.
- All pages pre-render at build time; anything dynamic goes through the API.

## Repo layout

- `Dressfield.web/` — Next.js app (the deployable frontend)
- `Dressfield.docs/` — architecture docs and references
- `Dressfield.BussinesStrategy/` — business strategy notes
- `.planning/` — GSD workflow artifacts (`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`)
