
# Prylad

Free online tools for developers, designers, and everyday use. Generators, converters, formatters, and utilities — all running in the browser. No sign-up, no server-side processing of your data.

## What it is

Prylad is a single web app that bundles dozens of small tools:

- **QR & barcodes** — QR generator/reader, barcode generator, URL tools  
- **Colors** — color generator, converter, palette from image  
- **Generators** — UUID, names, numbers, Lorem Ipsum, slugs, avatars  
- **Images** — watermark, placeholder, favicon, resize, format conversion  
- **Text** — word counter, case converter, diff, transliteration, speech-to-text, text-to-speech  
- **Converters** — Base64, CSV↔JSON, temperature, units, Roman numerals, number bases, Morse, text↔binary  
- **Code** — JSON/CSS/JS/SQL/XML/YAML formatters, HTML entities, regex tools, JWT decoder, cron, Markdown  
- **CSS/Design** — box shadow, border radius, font pairing, contrast checker, typography scale, layout generator  
- **Security** — password generator, hash generator, text encryption  
- **Time** — world clock, date/age calculator, timezone converter, Unix timestamp  
- **Fun** — dice roller, decision maker, wheel of fortune, meme generator, ASCII art, palindrome checker  

Everything runs client-side: your data never leaves your device unless you choose to use features that require it (e.g. browser APIs).

## Tech stack

- **Next.js 14** — React framework, App Router  
- **TypeScript**  
- **Tailwind CSS**  
- **Libraries** — `qrcode`, `jsqr`, `jsonpath-plus` for specific tools  

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Dev server (port 3010)   |
| `npm run build`| Production build         |
| `npm start`    | Run production (3010)    |
| `npm run lint` | ESLint                   |
| `npm test`     | Jest tests               |

## Project structure

```
├── app/
│   ├── layout.tsx           # Root layout, metadata, theme
│   ├── page.tsx             # Home page with tool categories
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   └── [tool]/              # One folder per tool (page.tsx, layout.tsx)
├── components/
│   ├── Layout.tsx           # Page shell (nav, header, footer)
│   ├── Navigation.tsx       # Sidebar + search modal
│   ├── SearchModal.tsx      # Tool search (⌘K)
│   ├── Breadcrumbs.tsx
│   ├── RelatedTools.tsx
│   ├── StructuredData.tsx   # JSON-LD for SEO
│   ├── HelpPanel.tsx
│   ├── HistoryPanel.tsx
│   ├── Tooltip.tsx
│   ├── FileDropZone.tsx
│   ├── QRCodeGenerator.tsx
│   └── SEOContent.tsx
├── contexts/
│   └── ThemeContext.tsx     # Dark/light theme
├── hooks/
│   ├── useHistory.ts
│   ├── useKeyboardShortcuts.ts
│   └── useUndoRedo.ts
├── lib/
│   ├── seo.ts               # Metadata helpers
│   ├── seo-helpers.ts       # Breadcrumbs, related tools
│   └── structured-data.ts   # Schema.org JSON-LD
└── __tests__/
```

## SEO

- Metadata and Open Graph per page  
- JSON-LD (WebApplication, FAQ, HowTo, BreadcrumbList where relevant)  
- Sitemap and robots.txt  
- Semantic HTML and accessibility (ARIA, keyboard navigation)  

