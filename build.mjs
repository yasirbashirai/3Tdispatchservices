#!/usr/bin/env node
/**
 * Static site build for 3T Dispatch Services.
 * Two pages: index.html (full landing page) and carriers.html (carrier onboarding).
 * Reads _src/pages, injects shared header/footer/CTA, writes plain HTML to the root.
 *
 * Usage: node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const SITE = "https://www.3tdispatchservices.com";
const PHONE = "404-429-0224";
const PHONE_HREF = "tel:+14044290224";
const EMAIL = "3tdispatchservices@gmail.com";
const ADDRESS = "11585 Jones Bridge Rd., Ste 420-125, Johns Creek, GA 30022";

/* Anchor nav for the landing page, plus the carrier signup page. */
const NAV = [
  { key: "services", label: "Services", href: "index.html#services" },
  { key: "equipment", label: "Equipment", href: "index.html#equipment" },
  { key: "how-it-works", label: "How it works", href: "index.html#how-it-works" },
  { key: "coverage", label: "Coverage", href: "index.html#coverage" },
  { key: "reviews", label: "Reviews", href: "index.html#reviews" },
  { key: "faq", label: "FAQ", href: "index.html#faq" }
];

const ICON = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6.3 6.3l1.2-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

function header(navKey, root) {
  const links = NAV.map((item) => {
    const active = item.key === navKey ? " is-active" : "";
    return `<li class="nav__item"><a class="nav__link${active}" href="${root}${item.href}" data-spy="${item.key}">${item.label}</a></li>`;
  }).join("\n          ");

  const mobileLinks = NAV.map((item) =>
    `<li><a href="${root}${item.href}">${item.label}<span>0${NAV.indexOf(item) + 1}</span></a></li>`
  ).join("\n      ");

  return `<a class="skip-link" href="#main">Skip to content</a>
  <div class="topbar">
    <div class="container">
      <div class="topbar__meta">
        <span class="topbar__tag">Now onboarding owner-operators</span>
        <span class="topbar__item">${ICON.clock}Mon–Fri, 8:00am–6:00pm ET</span>
        <span class="topbar__item">${ICON.pin}Johns Creek, GA · Serving 48 states</span>
      </div>
      <div class="topbar__meta">
        <a class="topbar__item" href="${PHONE_HREF}">${PHONE}</a>
        <a class="topbar__item" href="mailto:${EMAIL}">${EMAIL}</a>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="${root}index.html" aria-label="3T Dispatch Services home">
        <img src="${root}assets/img/logo.png" alt="3T Dispatch Services" width="340" height="216">
      </a>
      <nav class="nav" aria-label="Primary">
        <ul class="nav__list">
          ${links}
        </ul>
      </nav>
      <div class="header-actions">
        <a class="header-phone" href="${PHONE_HREF}">${ICON.phone}${PHONE}</a>
        <a class="btn" href="${root}carriers.html">Carrier signup
          <svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu"><span></span></button>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
    <div class="mobile-nav__head">
      <img src="${root}assets/img/logo-white.png" alt="3T Dispatch Services" width="340" height="216">
      <button class="mobile-nav__close" type="button" aria-label="Close menu">✕</button>
    </div>
    <ul>
      ${mobileLinks}
    </ul>
    <div class="mobile-nav__actions">
      <a class="btn btn--light" href="${root}carriers.html">Carrier signup</a>
      <a class="btn btn--outline-light" href="${PHONE_HREF}">Call ${PHONE}</a>
    </div>
    <div class="mobile-nav__contact">
      <a href="mailto:${EMAIL}">${EMAIL}</a>
      <span>Mon–Fri, 8:00am–6:00pm ET</span>
    </div>
  </div>
  <div class="mobile-bar">
    <a class="btn btn--ghost" href="${PHONE_HREF}">${ICON.phone}Call dispatch</a>
    <a class="btn" href="${root}carriers.html">Carrier signup</a>
  </div>`;
}

function quoteForm(root, variant = "") {
  const id = "quote-" + Math.random().toString(36).slice(2, 8);
  return `<div class="quote-panel">
      <h3${variant === "band" ? ' id="cta-form-title"' : ""}>Request a dispatch call</h3>
      <p>Tell us what you run. We will call to discuss your lanes, your equipment, and how dispatch would work for your operation.</p>
      <form class="form" name="dispatch-request" method="POST" novalidate data-netlify="true" netlify-honeypot="bot-field" data-form="quote" aria-label="Request a dispatch call">
        <input type="hidden" name="form-name" value="dispatch-request">
        <p class="hp"><label>Do not fill this out<input name="bot-field"></label></p>
        <div class="field">
          <label for="${id}-name">Name <span class="req">*</span></label>
          <input id="${id}-name" name="name" type="text" autocomplete="name" required placeholder="Your name">
          <span class="field__error"></span>
        </div>
        <div class="form__row">
          <div class="field">
            <label for="${id}-phone">Phone <span class="req">*</span></label>
            <input id="${id}-phone" name="phone" type="tel" autocomplete="tel" required placeholder="(404) 555-0123">
            <span class="field__error"></span>
          </div>
          <div class="field">
            <label for="${id}-email">Email</label>
            <input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="you@company.com">
            <span class="field__error"></span>
          </div>
        </div>
        <div class="field">
          <label for="${id}-equipment">Equipment <span class="req">*</span></label>
          <select id="${id}-equipment" name="equipment" required>
            <option value="">Select trailer type</option>
            <option>Dry van</option>
            <option>Reefer</option>
            <option>Flatbed</option>
            <option>Power only</option>
            <option>Mixed fleet</option>
          </select>
          <span class="field__error"></span>
        </div>
        <div class="field">
          <label for="${id}-notes">Anything we should know</label>
          <textarea id="${id}-notes" name="notes" rows="2" placeholder="Home base, lanes you prefer, number of trucks"></textarea>
        </div>
        <button class="btn btn--lg btn--block" type="submit">Request my call
          <svg class="icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
        </button>
        <p class="form__note">${ICON.clock}We reply within one business day, Mon–Fri.</p>
        <div class="form__status" role="status" aria-live="polite"></div>
      </form>
    </div>`;
}

function ctaBand(root) {
  return `<section class="section cta-band" aria-labelledby="cta-title">
    <div class="container cta-band__grid">
      <div class="reveal">
        <p class="eyebrow">Next step</p>
        <h2 id="cta-title">Tell us about your operation.</h2>
        <p class="lead" style="margin-top:.75rem">A short call is enough to know whether we are the right dispatch partner for your trucks. No scripts, no pressure. Just a clear look at your lanes and equipment.</p>
        <ul class="cta-band__points">
          <li>Equipment-specific dispatch for dry van, reefer, and flatbed</li>
          <li>Based in Johns Creek, Georgia, with nationwide lane coverage</li>
          <li>Direct access to the dispatcher assigned to your truck</li>
        </ul>
        <p style="margin-top:1.5rem"><a class="link-arrow" href="${root}carriers.html">Documents ready? Start carrier signup</a></p>
        <p style="margin-top:1rem"><a class="link-arrow" href="${PHONE_HREF}">Call ${PHONE}</a></p>
      </div>
      <div class="reveal reveal-delay-2">${quoteForm(root, "band")}</div>
    </div>
  </section>`;
}

function footer(root) {
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer__main">
        <div class="footer__brand">
          <img src="${root}assets/img/logo-white.png" alt="3T Dispatch Services" width="340" height="216">
          <p>Freight dispatch for owner-operators and small fleets. We find the loads, negotiate the rate, handle the paperwork, and keep you moving.</p>
          <p class="footer__tagline">We keep you moving.</p>
          <div class="footer__contact">
            <a href="${PHONE_HREF}">${ICON.phone}${PHONE}</a>
            <a href="mailto:${EMAIL}">${ICON.mail}${EMAIL}</a>
            <span style="display:flex;gap:.5rem;align-items:flex-start">${ICON.pin}<span>${ADDRESS}</span></span>
            <span style="display:flex;gap:.5rem;align-items:center">${ICON.clock}<span>Mon–Fri, 8:00am–6:00pm ET</span></span>
          </div>
        </div>
        <div class="footer">
          <h2>Dispatch</h2>
          <ul class="footer__links">
            <li><a href="${root}index.html#services">Services</a></li>
            <li><a href="${root}index.html#equipment">Equipment we run</a></li>
            <li><a href="${root}index.html#how-it-works">How it works</a></li>
            <li><a href="${root}index.html#coverage">Lane coverage</a></li>
            <li><a href="${root}index.html#requirements">Carrier requirements</a></li>
          </ul>
        </div>
        <div class="footer">
          <h2>Carriers</h2>
          <ul class="footer__links">
            <li><a href="${root}carriers.html">Carrier signup</a></li>
            <li><a href="${root}index.html#reviews">Carrier reviews</a></li>
            <li><a href="${root}index.html#faq">FAQ</a></li>
            <li><a href="${root}index.html#contact">Contact the desk</a></li>
            <li><a href="${root}index.html#about">About 3T</a></li>
          </ul>
        </div>
        <div class="footer">
          <h2>Coverage</h2>
          <ul class="footer__links">
            <li><a href="${root}index.html#coverage">Southeast lanes</a></li>
            <li><a href="${root}index.html#coverage">Midwest lanes</a></li>
            <li><a href="${root}index.html#coverage">Northeast lanes</a></li>
            <li><a href="${root}index.html#coverage">Texas and South Central</a></li>
            <li><a href="${root}index.html#coverage">Nationwide</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© <span data-year>2026</span> 3T Dispatch Services. All rights reserved. · Active MC authority required.</span>
        <div class="footer__legal">
          <a href="${root}privacy.html">Privacy</a>
          <a href="${root}terms.html">Terms</a>
          <a href="${root}sitemap.xml">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
  <script src="${root}assets/js/main.js" defer></script>`;
}

function layout(meta, body) {
  const root = "";
  const canonical = SITE + (meta.path ? "/" + meta.path : "/");
  const ogImage = meta.ogImage || "assets/img/hero-dryvan.jpg";
  const schema = meta.schema
    ? `<script type="application/ld+json">${JSON.stringify(meta.schema)}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0a0e24">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="3T Dispatch Services">
  <meta property="og:title" content="${meta.ogTitle || meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.ogTitle || meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${SITE}/${ogImage}">
  <link rel="icon" href="${root}favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&family=Oswald:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${root}assets/css/styles.css">
  <script>document.documentElement.className += " js";</script>
  ${schema}
</head>
<body data-page="${meta.nav || ""}">
  ${header(meta.nav, root)}
  <main id="main">
${body}
  </main>
  ${meta.cta === false ? "" : ctaBand(root)}
  ${footer(root)}
</body>
</html>
`;
}

function parseMeta(source, file) {
  const match = source.match(/^<!--META([\s\S]*?)-->/);
  if (!match) throw new Error("Missing META block in " + file);
  const meta = JSON.parse(match[1]);
  if (meta.path === undefined) throw new Error("Missing path in " + file);
  if (!meta.title) throw new Error("Missing title in " + file);
  return { meta, body: source.slice(match[0].length).replace(/^\s*\n/, "") };
}

const SRC = join(ROOT, "_src/pages");
for (const file of readdirSync(SRC)) {
  if (!file.endsWith(".html")) continue;
  const source = readFileSync(join(SRC, file), "utf8");
  const { meta, body } = parseMeta(source, file);
  mkdirSync(ROOT, { recursive: true });
  writeFileSync(join(ROOT, meta.path || "index.html"), layout(meta, body));
  console.log("built", meta.path || "index.html");
}

/* sitemap: two marketing pages plus legal utilities */
const pages = [
  ["", 1.0],
  ["carriers.html", 0.9],
  ["privacy.html", 0.2],
  ["terms.html", 0.2]
];
const urls = pages.map(([p, priority]) => `  <url>
    <loc>${SITE}/${p}</loc>
    <changefreq>${p === "" ? "weekly" : "monthly"}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`).join("\n");

writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

writeFileSync(join(ROOT, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${SITE}/sitemap.xml
`);

console.log("sitemap and robots written");
