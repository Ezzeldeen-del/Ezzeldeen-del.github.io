# Ezzeldeen Anwer — Portfolio

Single-page portfolio (static HTML/CSS/JS, no build step). Black canvas, mono labels, grotesque
headlines, lime accent, and a WebGL "lead router" centerpiece.

```
index.html          the page (all copy lives here)
css/style.css       styles + responsive rules
js/hero.js          Three.js centerpiece (the network behind the hero)
js/main.js          loader, menu, scroll indicator, sticky works, text fills, footer
assets/logo/        logo placeholder — replace when the final logo is ready (see its README)
assets/favicon.svg  browser-tab icon
```

## Run locally

Any static server works, e.g.

```
python -m http.server 8000
```

then open http://localhost:8000. (Opening `index.html` directly from disk also works in most browsers.)

## Deploy (pick one)

- **Vercel** — `vercel` is already installed on this machine. From this folder run `vercel` and follow
  the prompts (`vercel --prod` for the production URL). Or drag the folder onto https://vercel.com/new.
- **Netlify** — drag the folder onto https://app.netlify.com/drop.
- **GitHub Pages** — push this folder to a repo, then Settings → Pages → Deploy from branch (`main`, `/root`).
- **Cloudflare Pages** — connect the repo or upload the folder.

No environment variables, no build command, output directory is the folder root.

## After going live

1. Add `<link rel="canonical" href="https://YOUR-DOMAIN/">` in `index.html` (`<head>`).
2. Add an `og:image` (1200×630 PNG) so LinkedIn/WhatsApp previews show an image.
3. Replace `assets/logo/logo.svg` with the final logo (instructions in `assets/logo/README.md`).

## Editing content

- **Latest** panel (hero, bottom-right): `.latest__list` in `index.html`.
- **Selected Work**: each `<article class="work">` — the counter and scroll length adapt automatically to
  the number of articles. Labels: `self-directed`, `client`, `freelance build`.
- **Mission / Vision**: `.statement__text` lines and `.statement__en` paragraph.
- **Services**, **About** facts, **Contact** links: plain HTML in their sections.

## Backend (later)

Contact currently uses `mailto:` and LinkedIn. When the backend is ready, replace the two `.cta` links
in the footer with a form and post it to your endpoint — no other part of the page depends on it.

## Third-party assets

- Fonts: Archivo + IBM Plex Mono via Google Fonts.
- Three.js r128 via cdnjs (`js/hero.js`). If the CDN is blocked, the page falls back to a static glow.
