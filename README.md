# 3T Dispatch Services — website

Two-page static site:
- **index.html** — the full landing page (hero, services, support, process, equipment, about, coverage, comparison, carrier requirements, reviews, FAQ, contact + quote form).
- **carriers.html** — the carrier signup page (requirements, document checklist, 4-step onboarding form with uploads and e-signature).

Plus `privacy.html` and `terms.html`, which are linked from the footer and are legal utilities rather than marketing pages.

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Rebuild after editing content or partials:

```bash
node build.mjs
```

## Structure

```
index.html               Landing page (single-page funnel)
carriers.html            Carrier signup / onboarding form
privacy.html, terms.html Legal pages
assets/css/styles.css    Design system and components
assets/js/main.js        Nav, scroll spy, reveal motion, filters, FAQ, forms, wizard, signature
assets/img/              Optimized photos, logo lockup, favicon
_src/pages/              Editable HTML sources with META front matter
build.mjs                Injects header/footer, writes sitemap.xml and robots.txt
```

Edit `_src/pages/*.html`, then run `node build.mjs`. Each source starts with a
`<!--META ... -->` JSON block holding the title, description, canonical path, OG
image, and optional JSON-LD schema. The shared header, mobile drawer, footer, and
quote form live in `build.mjs`.

Navigation is anchor-based on the landing page (Services, Equipment, How it works,
Coverage, Reviews, FAQ). A scroll spy highlights the section currently in view.

## Forms and deployment (important)

Forms are wired for **Netlify Forms** with `data-netlify="true"` and a hidden
`form-name`. Deploy to Netlify (drag the folder into Netlify Drop or connect the
repo) and submissions appear under **Forms** in the dashboard. File uploads work
on the carrier application because the form is multipart.

Form names in use: `dispatch-request-main`, `dispatch-request` (shared CTA form),
`carrier-application`.

On other hosts (Vercel, plain static hosting), Netlify Forms will not run. Point
`submitToNetlify()` in `assets/js/main.js` at your handler (Formspree, Basin, a
serverless function) or use its mailto fallback. Success and error states are
already built. In local development the submit handler skips the network request
and shows the success state so you can review the flow; nothing is sent locally.

## Before launch

1. **Replace the testimonial content.** The six reviews are illustrative
   placeholders. Replace them with real, permissioned quotes before publishing.
2. **Confirm the dispatch board and lane figures.** Both are labelled
   illustrative, but update them to current lanes and rates.
3. **Review the legal pages.** Privacy and Terms are practical templates, not
   legal advice.
4. **Set the domain.** Canonical URLs and the sitemap use
   `https://www.3tdispatchservices.com`. Update `SITE` in `build.mjs` if that
   changes, then rebuild.
5. **Social links.** No social profiles were supplied, so none are linked.

## Notes

- The header uses the supplied logo lockup exactly as provided. Because it is a
  vertical lockup, the header is sized to keep the wordmark legible. A horizontal
  version of the logo would allow a shorter header if you prefer.
- Photography is optimized from the supplied truck image set. The image with
  visible third-party (TQL) branding and the watermarked stock frame were
  intentionally excluded.
- No dispatch fees or pricing appear anywhere on the site; all calls to action
  route to a call request or the carrier signup, per the brief.
- Accessibility: skip link, visible focus states, keyboard-operable filters and
  accordions, focus trap in the mobile drawer, labelled fields with inline
  errors, typed-signature alternative, and reduced-motion support.
