<h1 align="center">✦ itsherious.github.io ✦</h1>

<p align="center">
  <strong>Personal Website — driven entirely by one JSON file</strong>
</p>

---

## 📖 About

**itsherious.github.io** is a personal single-page portfolio: profile, skills, projects, and contact/donation links — all in one place. Every piece of content lives in **[`info.json`](./info.json)**, so you can restyle nothing and still make the whole site yours by editing one file.

This is an upgraded version of the original single-page template, with a JSON-driven content engine, a light/dark theme toggle, motion, accessibility, and SEO built in.

---

## ✨ What's new in this upgrade

- **Content lives in `info.json`** — name, bio, skills, projects, socials, donation links, and contact info are all read from one file. No HTML editing needed for day-to-day updates.
- **New "SKILLS" section** — shows as chips; the nav item hides itself automatically if you leave the list empty.
- **Light / dark theme toggle** — dark is a "Neon Circuit" look (magenta + cyan on deep violet-black), light is "Pop Paper" (the same ink on a soft bright page). Remembers your choice, and respects your OS preference on first visit.
- **Two-layer motion system** — a full CSS-only animation layer that works on its own (staggered entrances, bounce-easing hovers, drifting background blobs, a glowing profile frame, a status-dot ripple, and more), plus an optional GSAP-powered enhancement layer (`assets/js/motion.js`) that adds a cursor follower, magnetic header buttons, a character-by-character name reveal, grid-aware stagger, and 3D tilt on project cards. The GSAP layer loads from a CDN and fails silently if it can't reach it — the CSS layer never depends on it. Full breakdown in [`DESIGN.md`](./DESIGN.md).
- **Copy-to-clipboard** — any contact entry with a `copyValue` (like an email address) gets a copy button that morphs to a checkmark and a toast confirmation.
- **Accessibility pass** — skip-to-content link, visible focus states, `aria-current`/`aria-expanded`/`aria-hidden` wired up correctly, `Escape` closes the menu, reduced-motion support (checked independently in both the CSS layer and the GSAP layer, since inline styles the latter sets can't be reached by a CSS media query). Color tokens are contrast-checked against WCAG AA (4.5:1) in both themes — see [`DESIGN.md`](./DESIGN.md).
- **Self-hosted typeface** — JetBrains Mono ships as local WOFF2 (`assets/fonts/`) instead of relying on it being installed system-side, so the intended look renders everywhere instead of silently falling back to a generic monospace font.
- **Deep-linkable sections** — the nav panels (About/Skills/Projects/Contact) are reflected in the URL hash (`#skills`, `#projects`, …), so links are shareable/bookmarkable and the back/forward buttons step through panel history correctly.
- **Localized to Vietnamese, deliberately partial** — `<html lang="vi">`, and only the About paragraphs (the personal-narrative section) are in Vietnamese. Everything else — nav, labels, statuses, toasts, meta tags, the 404 page — stays in English, matching how a Vietnamese developer audience aiming at international roles actually writes UI copy. See `DESIGN.md` for the exact split.
- **SEO pass** — title/description/keywords, canonical link, Open Graph + Twitter Card tags, and a `Person` JSON-LD block, all filled in from `info.json` at load time (and with matching static defaults in `index.html` for crawlers that don't run JavaScript).
- **Restyled 404 page** to match the new look.

---

## 🚀 Quick start

1. Open **`info.json`** and replace the placeholder values with your own (see the schema below).
2. Because the page loads `info.json` with `fetch()`, opening `index.html` directly from disk (`file://`) will be blocked by the browser. Serve it locally instead:

   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```

   Then open the printed `http://localhost` address.
3. Push to a GitHub repository named `<your-username>.github.io` and enable **GitHub Pages** in the repo settings (or use any other static host — there's no build step).
4. If you're using a custom domain, add a `CNAME` file to the repo root containing just your domain name, and update `siteUrl` in `info.json` plus the URLs in `robots.txt` and `sitemap.xml` to match.

---

## 🗂 `info.json` schema

| Key | Type | Notes |
|---|---|---|
| `meta.siteTitle` | string | Browser tab title / OG title |
| `meta.siteDescription` | string | Meta description / OG description |
| `meta.keywords` | string[] | SEO keywords |
| `meta.siteUrl` | string | Full canonical URL, e.g. `https://yourname.github.io` |
| `meta.themeColor` | string | Hex color used for the browser theme-color meta tag |
| `meta.language` | string | HTML `lang` attribute — currently `vi` in this repo |
| `profile.name` | string | Display name / handle |
| `profile.alternateName` | string | Real name (used in structured data) |
| `profile.avatar` | string (URL) | Profile photo, also used as favicon and social preview image |
| `profile.tagline` | string | Short line under your name (gets a typing animation) |
| `profile.role` | string | Shown in the meta strip, e.g. `Developer` |
| `profile.location` | string | Shown in the meta strip |
| `profile.status` | string | Shown next to the pulsing status dot |
| `about` | string[] | One paragraph per array entry. Supports `**bold**` |
| `skills` | `{name, icon}[]` | `icon` is a [Remix Icon](https://remixicon.com/) class name. Leave the array empty to hide the section entirely |
| `projects` | `{name, description, url, icon, tags}[]` | `tags` is optional |
| `social` | `{platform, url, icon}[]` | Rendered under Contact → Social |
| `donations` | `{platform, url, icon}[]` | Rendered under Contact → Support, highlighted |
| `contact` | `{platform, url, icon, copyValue}[]` | `copyValue` (optional) adds a copy-to-clipboard button, useful for emails |

Icons use the [Remix Icon](https://remixicon.com/) set (already loaded via CDN in `index.html`) — browse their site for class names like `ri-github-fill` or `ri-mail-fill`.

---

## 🗃 Project structure

```
itsherious.github.io/
├── index.html            # Page skeleton + static SEO fallback content
├── info.json              # ← Edit this to make the site yours
├── 404.html
├── robots.txt
├── sitemap.xml
├── LICENSE
├── DESIGN.md             # Design tokens, contrast ratios, typography reference
└── assets/
    ├── css/style.css      # Theming, layout, animation
    ├── js/script.js       # Fetches info.json and renders the page
    ├── js/motion.js       # Optional GSAP enhancement layer — see DESIGN.md
    └── fonts/             # Self-hosted JetBrains Mono (WOFF2 + OFL license)
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <sub>✦ itsherious.github.io — Personal Website ✦</sub>
</p>
