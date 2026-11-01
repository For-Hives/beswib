# 🏁 Beswib - Switch your bib and Be ready

**Beswib** is a platform that facilitates the legal and secure resale of race bibs between runners — with full organizer control, zero manual workload, and 100% compliance.

## 🔧 Key Features

### 🎽 For Sellers (Runners):

- List your bib for resale (public or private)
- Define your own price
- Secure payment upon successful transfer
- Upload necessary documents (medical certificate, etc.)
- Cancel listing anytime without fees

### 🏃 For Buyers:

- Browse valid bibs for listed races
- Receive official transfer confirmation and bib in your name
- Get notified if bibs are available for a specific race
- Payments are held until validation to avoid fraud

### 🏟️ For Race Organizers:

- Bib transfers under control (no ghost runners)
- Free, no technical integration needed
- Manual validation or DB/API integration available
- Optional limits: transfer deadline, custom data fields
- Better waste management and accurate forecasting

---

## 🛠 Admin/Organizer Options

```json
{
	"race_name": "Trail de l’Écume",
	"registration_open_date": "2025-07-01",
	"bib_pickup_date": "2025-09-10",
	"location": "Biarritz, France",
	"type": "Trail",
	"distance_km": 42,
	"elevation_gain_m": 1200,
	"format": "Solo",
	"logo_url": "https://...",
	"additional_notes": "Bring ID to bib pickup.",
	"tshirt_sizes": ["S", "M", "L", "XL"],
	"meal_option": true,
	"socks_option": true,
	"custom_options": {
		"transport": ["Shuttle", "Own car"],
		"insurance": ["None", "Standard", "Premium"]
	},
	"base_price": 50.0
}
```

All organizer fields are editable via admin JSON interface. Optional features like custom dropdowns, file uploads or toggles are supported.

---

## 📑 Seller Submission Fields

- FFA number (optional)
- PPS number
- Club (optional)
- Certificate
- Full name
- Email
- Phone number
- Emergency contact (name, phone)
- Address
- Date of birth
- Purchase price
- Original registration reference number

---

## 🛒 Transaction Flow

### Seller:

1. Registers & logs in
2. Adds bib info + sets a price
3. We verify with organizer (via DB/API/manual)
4. If valid → listed
5. Once sold → payout available via Beswib balance

### Buyer:

1. Searches or browses listed bibs
2. Buys with secure payment
3. Provides required personal details
4. Waits for confirmation + transfer from organizer
5. Receives official bib assignment + confirmation

### Internally:

- Payments processed & held
- Organizer notified via Excel/API
- DB updates sent on a drip schedule
- Buyer & seller notified at every step

---

## 🔒 Legal & Risk Management

- Only authorized races are listed
- Custom rules enforced per organizer
- Transfers blocked automatically after organizer-defined cutoff
- All parties are identified and verified
- Platform fully GDPR compliant

---

## 🔗 Competitor & Partner Research

**International Peers**:

- ActiveWorks, RaceRoster, Eventrac, RunSignup
  **French Market**:
- Strayde, Klikego, MilesRepublic
  **Direct Competitors**:
- Swika (via Njuko), TheXchange, Bib2Life

---

## 🧑‍💻 Development

Next.js (App Router) + TypeScript, installed with pnpm. Copy `.exemple.env` to `.env` and fill it in.

- `pnpm dev`: local server.
- `pnpm check`: Biome (lint, formatting, import order), failing on errors and warnings. Also run in CI.
- `pnpm check:write`: apply formatting, safe lint fixes and import order.
- `pnpm tsc`: type check.
- `pnpm test:run`: unit tests (Vitest).
- `pnpm build`: production build.

The commit hook (Husky + lint-staged) runs Biome on the staged files and rejects warnings.

### Analytics

Product events go to a self-hosted Umami. Every event and every property is declared once, in `src/lib/analytics/catalog.ts` (the rules for adding one are at the top of that file); nothing outside that catalogue can be sent, and no event carries anything that identifies a visitor.

- In the browser: `track()` and `trackView()` from `@/lib/analytics/client`, `<TrackClick>` around a link, `umamiAttrs()` on a button.
- On the server (payment captured, sale completed, account created): `trackServer()` from `@/lib/analytics/server`.
- The page URL is cleaned before it leaves the browser: locale prefix removed, only `utm_*` parameters kept.

Umami sets no cookie and is not subject to the cookie banner. Google Analytics is: it only exists when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (production), and its tag is loaded only once the visitor has allowed the "Analytics" category of the banner (c15t in offline mode, configured in `src/lib/consent/`). The gate is `<ConsentedGoogleAnalytics>`, mounted inside `<ConsentRoot>` in the root layout; a third-party script that needs consent must be mounted the same way, never directly in the layout.

What Google Analytics sends is cleaned too (`src/lib/analytics/google-hits.ts`): gtag.js reads the address bar itself and has no before-send hook, so its hits are rewritten where they leave the page. Every URL in a hit loses its query string except `utm_*` (the locale stays), and the term of a site search is removed. A new query parameter therefore needs no change there; a new id in a path that points at one person's record goes in `maskPath()`.

---

## 📞 Contact

Looking to integrate your race or explore a partnership?
📧 [hello@beswib.com](mailto:hello@beswib.com)
🗓 Book a 10-min intro call

---

## 🧪 TODOs / Future Dev

- [ ] OAuth for partner orgs
- [ ] Multi-language support (FR/EN/ES)
- [ ] Admin dashboard (course stats, transfer logs, etc.)
- [ ] Race listing aggregator from competitors

---

> 🧠 _"Less waste, fewer ghost runners, zero manual work — let Beswib handle the headache."_
