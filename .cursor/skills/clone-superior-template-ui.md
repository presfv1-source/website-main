# Clone Superior Template UI (/clone-superior-ui)

Use when the user wants to recreate the visual style and structure of:
`https://superior-template.framer.website/`

## Cursor Script Prompt

Copy and paste this entire prompt into Cursor when you want it to build the page:

```md
You are my senior frontend engineer. Recreate the marketing UI style of https://superior-template.framer.website/ for this Next.js + Tailwind project.

## Goals
- Rebuild the **look and feel** (not a pixel-perfect or copyrighted asset-for-asset clone).
- Keep existing branding text where appropriate, but use the same modern SaaS visual language:
  - soft gradient background accents
  - clean sans-serif typography
  - large hero with strong headline + CTA
  - trust/social-proof strip
  - feature grid cards
  - integrations/logos section
  - testimonial cards
  - pricing preview
  - FAQ accordion
  - final CTA band + footer

## Requirements
1. Use reusable React components and keep sections modular.
2. Use Tailwind utility classes only (no external CSS frameworks).
3. Prefer existing `@/components/ui/*` components when available.
4. Ensure responsive behavior at mobile, tablet, desktop breakpoints.
5. Add subtle hover states and transitions (`transition`, `duration-200/300`).
6. Keep accessibility in mind:
   - semantic heading order
   - sufficient contrast
   - focus-visible styles on interactive elements
7. Do not break existing routes.

## Implementation Plan
1. Audit current marketing homepage files under `src/app/(marketing)`.
2. Create/update section components under `src/components/marketing`:
   - `hero-section.tsx`
   - `social-proof-strip.tsx`
   - `features-grid.tsx`
   - `integrations-section.tsx`
   - `testimonials-section.tsx`
   - `pricing-preview.tsx`
   - `faq-section.tsx`
   - `final-cta.tsx`
3. Compose these in the homepage route.
4. Add mock data arrays in a single colocated file (or `content/marketing-home.ts`).
5. Run checks:
   - `npm run lint`
   - `npm run build`

## Visual Direction (Tailwind tokens)
- Container: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Section spacing: `py-16 sm:py-20 lg:py-24`
- Headline: `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight`
- Body text: `text-muted-foreground text-base sm:text-lg`
- Card style: `rounded-2xl border bg-background/80 backdrop-blur p-6 shadow-sm`
- Primary CTA: rounded button with clear hover/active states.
- Accent gradients: subtle radial/linear gradients behind hero and CTA.

## Deliverables
- Updated marketing page components.
- Any new reusable UI bits needed.
- Clean commit-ready code.
- Short summary of files changed.
```

## Notes
- This script is intentionally style-focused so you can adapt copy/content for any SaaS brand.
- If you need strict parity with the template, take screenshots and iterate section-by-section.
