# Consultancy site

Astro + Tailwind site for Pop Consulting (pop.consulting), a small AI strategy and implementation consultancy. The primary action is booking a call.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview
```

## Where to edit

- `src/config.ts`: name, tagline, email, nav, and **`bookingUrl`** (your Cal.com or Calendly link)
- `src/styles/global.css`: colours and fonts (`@theme` tokens)
- `src/pages/`: `index`, `services`, `about`, `book`, `404`
- `scripts/gradient-map.cjs`: recolour any image to the brand blend (`node scripts/gradient-map.cjs in.jpg out.jpg`)
- `src/components/PopHero.tsx`: home hero built on `src/components/ui/glyph-portal.tsx` (MIT, Christian Katzmann)
- `astro.config.mjs`: production domain (`https://pop.consulting`)

All page copy is placeholder text. Replace it once your positioning is settled.

## Deploy

Push to GitHub and import the repo into Vercel, Netlify or Cloudflare Pages. Build command: `npm run build`. Output directory: `dist`.
