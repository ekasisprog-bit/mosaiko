# Mosaiko — Project Instructions

## Project Overview
Ecommerce website for a Mexican entrepreneur selling custom photo fridge magnets. Users upload a photo, select a grid (3, 6, or 9 pieces), crop/adjust, and receive printed magnets with their image split across the tiles.

- **Reference site:** balcru.com (model the experience after this)
- **GitHub:** https://github.com/ekasisprog-bit/mosaiko.git
- **Developer:** Outer Haven (outerhaven.mx) — include credit in footer
- **Client:** Mexican entrepreneur (logo pending — use placeholder until received)

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 + CSS variables (design tokens)
- Framer Motion (animations)
- Zustand (state management)
- react-easy-crop (image cropping)
- HTML5 Canvas API (image splitting)
- Stripe Mexico (payments: OXXO, SPEI, cards)
- Supabase (Postgres + Storage + Auth)
- Resend (email)
- next-intl (i18n)
- Vercel (hosting)

## Language & Locale
- **Primary language:** Spanish (Mexico)
- **Secondary:** English toggle
- All UI text must be in Spanish first, with English translations
- Currency: MXN (Mexican Pesos)
- Use `next-intl` with `es` as default locale

## Mobile-First
The site MUST work on mobile, not only desktop. Design mobile-first, then scale up. Test on real mobile devices or accurate emulators. Minimum touch target: 48x48px.

## Admin Panel
The client needs a full admin panel to:
- Edit ALL site content (hero, announcements, FAQ, testimonials, about, etc.)
- Manage products and categories (CRUD)
- View and manage orders (see custom order images, update status, download print files)
- Preview analytics (Google Analytics 4 integration, Google Ads metrics)
- Configure settings (shipping, payments, notifications)

## Bug Handling Workflow
During testing, if you encounter bugs DO NOT fix them immediately. Follow this sequence:
1. **Replicate** — Confirm the bug is reproducible
2. **Isolate** — Find the root cause
3. **Fix** — Generate the fix
4. **Verify** — Replicate the original conditions to confirm the fix works

## Git Workflow
- **Commit and push frequently** — after every meaningful unit of work
- Never add `Co-Authored-By` lines to commits
- Use descriptive commit messages
- Keep the GitHub repo up to date at all times

## Legal Pages Required
Generate generic but compliant:
- Terms and Conditions
- Privacy Policy
- Cookie Policy
These must meet Google publishing requirements (Google Ads, Analytics compliance).

## Design Direction
- Warm, Mexican-inspired but modern aesthetic
- Terracotta + deep teal + marigold gold palette
- Playfair Display (headings) + DM Sans (body) typography
- Purposeful animations: staggered reveals, spring-based interactions, smooth transitions
- NOT generic AI slop — every design choice must be intentional
- Load `frontend-design` skill for all UI work
- Load `react-best-practices` + `vercel-react-best-practices` for React work

## Existing Assets
- `MOSAIKO-images/` — 7 categories of product photos (categorized):
  - Categoria Mosaicos, Studio Ghibli, Arte, Save the Date, Flores, Album de Spotify, Polaroid
- Logo: pending from client

## Support Agents
Follow the agents-protocol (see memory/agents-protocol.md):
- Launch Gemini for research on unfamiliar APIs, post-May 2025 patterns
- Launch Codex for planning review, code audit, architectural analysis
- Claude is the main executor; they are peer reviewers

## Post-Code Checklist
Output after every implementation:
```
POST-IMPLEMENTATION REVIEW:
- Files modified: [list]
- Build: [pass/fail]
- Tests: [X/Y pass]
- Feature tested: [result]
- Docs updated: [CLAUDE.md / if needed]
```
