# Consultancy site

Astro + Tailwind site for a small AI strategy and implementation consultancy. The primary action is booking a call.

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
- `astro.config.mjs`: set `site` to your real domain before deploying

All page copy is placeholder text. Replace it once your positioning is settled.

## Deploy

Push to GitHub and import the repo into Vercel, Netlify or Cloudflare Pages. Build command: `npm run build`. Output directory: `dist`.
