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

Forms submit to **FormSubmit** at
`https://formsubmit.co/3tdispatchservices@gmail.com`, so every lead lands in the
client inbox. It needs no account and no server, so the forms work on any static
host (Netlify, Vercel, GitHub Pages, cPanel, plain file hosting).

- The quote form (landing page and CTA band) submits with AJAX and shows an
  inline confirmation.
- The carrier application posts natively into a hidden iframe so FormSubmit
  delivers the uploaded documents and the drawn signature as attachments while
  the page shows an inline thank-you. `thanks.html` remains as the no-JavaScript
  fallback via `_next`.

Form names in use: `dispatch-request-main`, `dispatch-request` (shared CTA form),
`carrier-application`.

### Activation (required once)

FormSubmit only delivers mail after the destination address is activated. On the
first submission it emails an **Activate Form** link to
`3tdispatchservices@gmail.com`. Until someone clicks that link, every submission
is rejected (`This form needs Activation`) and nothing is delivered. Check the
inbox and spam folder, click the link once, and submissions start arriving.

To copy a second address, add a hidden `_cc` field; the primary address is the
one that must be activated.

After activation, submissions arrive by email with all fields. The carrier
application attaches the uploaded documents and the drawn signature as files.

Local development now submits for real, so you can test the live endpoint from
`localhost`. To avoid sending during a design review, comment out the submit
handler or temporarily point the action/endpoint at a test address.

The endpoint lives in `FORM_ENDPOINT` in `assets/js/main.js` and in the `action`
attributes (`_src/pages/*.html` and `quoteForm()` in `build.mjs`). Rebuild with
`node build.mjs` after changing them.

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
