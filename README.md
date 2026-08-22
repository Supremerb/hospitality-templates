# Hospitality Website Templates

Three production-ready website templates for small hospitality businesses —
a cafe, a restaurant, and a hotel. Built with plain HTML, CSS and JavaScript.
No framework, no build step, no dependencies to install.

Each is deliberately its own design rather than one template recoloured:
different palettes, different type pairings, different 3D signature elements.

| Site | Type | Signature element |
|---|---|---|
| `aurora-cafe` | Cafe / coffee roaster | CSS-3D rotating coffee cup, 40 segments with directional shading |
| `sable-restaurant` | Fine dining | Draggable 3D dish carousel on a transform cylinder |
| `meridian-hotel` | Coastal hotel | 3D coverflow room selector + live booking widget |

---

## Structure

```
aurora-cafe/
├── index.html
├── css/style.css
├── js/main.js
├── img/            ← your photos go here
└── _headers        ← security headers for Netlify / Cloudflare Pages
```

Same shape for all three.

---

## Running locally

Because the CSS and JS are external files, opening `index.html` directly
from the filesystem works in most browsers but can hit CORS restrictions.
Serve it instead:

```bash
cd aurora-cafe
python3 -m http.server 8000
```

Then open http://localhost:8000

---

## Deploying

**Netlify** — drag the site folder onto https://app.netlify.com/drop.
Live HTTPS URL in seconds, free tier, no card required.

**Cloudflare Pages** — connect the GitHub repo, set the build command to
none and the output directory to the site folder.

**GitHub Pages** — works, but cannot set custom headers, so you lose the
`_headers` protections. Prefer Netlify or Cloudflare if that matters.

---

## Shared features

- Zoom lightbox: wheel zoom toward cursor, pinch on touch, double-tap
  toggle, drag to pan, keyboard `+` `−` `0` and arrow keys
- Preloader, scroll progress bar, sticky nav, mobile drawer
- IntersectionObserver scroll reveals and animated counters
- Live open/closed status computed from an editable hours object
- Magnetic buttons with a shine sweep on hover
- Client-side form validation
- JSON-LD structured data (`CafeOrCoffeeShop`, `Restaurant`, `Hotel`)
- `prefers-reduced-motion` respected throughout
- Visible focus states, ARIA on tabs, accordions and dialogs

---

## Customising

Search each `index.html` for `CHANGE:` — every value that needs replacing
is marked.

**Colours** live in the `:root` block at the top of `css/style.css`. Change
six or seven variables and the whole site rebrands.

**Opening hours** live in the `HOURS` object at the top of `js/main.js`.
24-hour decimals, `null` for a closed day, index `0` is Sunday. The hours
table in the HTML must be kept in sync manually.

```js
const HOURS = {0:[8,14], 1:null, 2:[7,15], 3:[7,15], 4:[7,15], 5:[7,15], 6:[8,14]};
```

---

## Images

The templates ship with picsum.photos placeholders so they look complete
before you have photos.

**For a real client, replace every one with photos you took at their venue.**
Stock photos of a different business on someone's site is worse than no
photos — owners notice immediately, and it undermines the whole pitch.

Once you do, remove the picsum entries from `img-src` in `_headers`.

---

## Security

Splitting the CSS and JS out of the HTML allows a stricter Content Security
Policy than the single-file versions: `script-src 'self'` with no
`'unsafe-inline'`, which is the single most valuable CSP directive.

`style-src` still carries `'unsafe-inline'` because a handful of inline
`style=""` attributes remain in the markup. Moving those to classes lets you
drop it and reach a fully strict policy.

**What a static site genuinely eliminates:** no server-side code means no
injection surface. No database means no SQL injection. No login means no
credential attacks. No CMS means no plugin CVEs — which is how the large
majority of small-business sites are actually compromised in practice.

**What still needs attention:** Google Fonts and picsum are third-party
origins you don't control; self-hosting the fonts removes both a privacy
concern and an availability risk. Any form wired to a real endpoint inherits
that endpoint's security. Client-side validation is UX, never a control.

Verify a deployment at https://securityheaders.com and
https://observatory.mozilla.org.

A note on claims: don't describe any site as having "zero vulnerabilities."
No competent security practitioner says that about anything. The accurate
version is stronger and holds up under questioning — no database, no login,
no CMS plugins, plus security headers most agencies skip.

---

## Browser support

Modern evergreen browsers. Uses CSS custom properties, `aspect-ratio`,
`backdrop-filter`, IntersectionObserver and Pointer Events. Degrades
acceptably without `backdrop-filter`.

Test the 3D elements on a mid-range Android device — that is where CSS 3D
transforms are most likely to struggle, and a stuttering hero is worse than
no animation at all.

---

## Licence

MIT. See `LICENSE`.

Fonts are served by Google Fonts under the SIL Open Font License.
Placeholder images are from picsum.photos and are for demonstration only.
