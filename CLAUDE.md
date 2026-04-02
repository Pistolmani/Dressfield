# Dressfield — Claude Instructions

## Installed Skills & Workflow Tools

### Superpowers (obra/superpowers)
Skills library wired via SessionStart hook. On each session you have access to composable skills:
- `/brainstorm` — refine ideas before coding
- `/write-plan` — break work into bite-sized tasks
- `/execute-plan` — run subagents per task with staged reviews
- TDD, systematic debugging, code review, git worktrees, and more

Use the `Skill` tool to load any skill on demand (e.g. `Skill("superpowers:test-driven-development")`).

### Get-Shit-Done (gsd-build/get-shit-done)
Phase-based context management system with 57 slash commands under `/gsd:`.

**Core workflow:**
```
/gsd:new-project → /gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

Key commands: `/gsd:help`, `/gsd:next`, `/gsd:progress`, `/gsd:debug`, `/gsd:review`

## Project Overview

Dressfield is an e-commerce website for a Georgian embroidery business. Customers browse pre-made embroidered products and order custom embroidery by uploading designs with a live preview mockup. Payments via Bank of Georgia iPay.

**Tech Stack:**
- Frontend: Next.js 15 + TypeScript (static export → Hostinger) — **This repo**
- Backend: ASP.NET Core 8 Web API (→ Azure App Service) — **[Separate repo](https://github.com/Pistolmani/Dressfield-api)**
- Database: MySQL 8 + Entity Framework Core (→ Hostinger)
- Payments: Bank of Georgia iPay (Helix.BankOfGeorgia.IpayClient)
- CSS/UI: Tailwind CSS + shadcn/ui
- State: TanStack Query + Zustand
- Analytics: Meta Pixel

**Language:** Georgian only for MVP

## Project Structure
- **Backend:** [Dressfield-api](https://github.com/Pistolmani/Dressfield-api) — Separate repo: ASP.NET Core 8 Web API (API, Core, Application, Infrastructure layers)
- `Dressfield.web/` — Next.js frontend (static export)
- `Dressfield.docs/` — Architecture docs and references
- `Dressfield.BussinesStrategy/` — Business strategy
- `.planning/` — GSD planning artifacts (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md)

## GSD Workflow State

**Current phase:** Phase 1 — Foundation & Scaffolding
**Total phases:** 7 | **Total requirements:** 47

Follow the GSD workflow. Before any work:
1. Check `.planning/STATE.md` for current phase
2. Check `.planning/ROADMAP.md` for phase details and success criteria
3. Check `.planning/REQUIREMENTS.md` for requirement definitions

## Key Constraints

- **Static export:** No SSR, no ISR, no Next.js API routes, no `next/image`, no middleware. All pages are pre-rendered at build time.
- **Hostinger:** Shared hosting, no Node.js runtime. Frontend deployed as static files.
- **Payment flow:** Redirect-based (not inline). User goes to BOG site, then returns. Webhook callbacks for status.
- **Codex delegation:** Use OpenAI Codex (via WSL `codex` command) for coding, research, and testing tasks to conserve Claude tokens. Opus for planning/architecture only.
