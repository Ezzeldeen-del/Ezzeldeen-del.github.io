# Ezzeldeen Anwer — Portfolio

**Live site:** https://ezzeldeen-del.github.io/

Source for my portfolio — a single-page site built to make one thing obvious in the first five
seconds: what I automate, and why it matters to a business losing deals to a slow lead pipeline.

## Structure

```
index.html          the page itself — every section, every word
css/style.css        all visual design: layout, color, type, responsive rules
js/hero.js           the animated network in the hero section
js/main.js           menu, scroll behavior, sticky sections, in-view animations
assets/logo/         logo — swap-in ready, see its own README
assets/favicon.svg   browser-tab icon
```

No build step, no framework, nothing to install. Open `index.html` and it runs.

## Running it locally

For previewing changes on your own machine only — this does not create a public link, and only
works on the computer running it.

```
python -m http.server 8000
```

Then open http://localhost:8000. Or just double-click `index.html` — most browsers render it
directly, no server needed.

## Deployment

Live on **GitHub Pages**, served straight from the `main` branch. To publish a change: commit,
push, and it rebuilds automatically within about a minute.

Other options, if this ever needs to move:

- **Vercel** — run `vercel` from this folder and follow the prompts, or drag the folder onto vercel.com/new.
- **Netlify** — drag the folder onto app.netlify.com/drop.
- **Cloudflare Pages** — connect the repo or upload the folder directly.

No environment variables, no build command — the output is just this folder.

## Next steps

1. Set `<link rel="canonical" href="https://ezzeldeen-del.github.io/">` in `index.html`'s `<head>`.
2. Add an `og:image` (1200×630) so link previews on LinkedIn/WhatsApp show an image instead of nothing.
3. Swap `assets/logo/logo.svg` for the final logo — instructions are in `assets/logo/README.md`.

## Editing content

- **Latest** panel (bottom-right of the hero): `.latest__list` in `index.html`.
- **Selected Work**: each project is one `<article class="work">` block — the counter and scroll
  length adjust automatically to however many exist. Tag each `self-directed`, `client`, or
  `freelance build`.
- **Mission / Vision**: `.statement__text` and the `.statement__en` line beneath it.
- **Services**, **About**, **Contact**: plain HTML in their sections — edit the text directly.

## Contact

The contact buttons open Gmail (pre-filled) or WhatsApp directly — no backend required. When a
real form is ready, swap the two `.cta` links in the footer for one that posts to it; nothing else
on the page depends on how contact is handled.

## Credits

- Typefaces: Archivo and IBM Plex Mono, via Google Fonts.
- 3D graphics: Three.js (r128), via cdnjs. If that CDN is ever unreachable, the hero falls back to
  a static glow instead of breaking.
