# CLAUDE.md — roadtrip-map

## Your job
Build `index.html` — a beautiful interactive road trip map that loads all data from `data/trip.json`.

## Data loading
```js
fetch('./data/trip.json').then(r => r.json()).then(data => init(data));
```
Never hardcode stop data or constants inside the HTML. Everything comes from the JSON.

## Tech
- Leaflet.js from unpkg CDN
- CartoDB Positron tiles (white/light map)
- Attribution (mandatory, must remain visible): © OpenStreetMap contributors © CARTO
- No frameworks, no build step — pure HTML/CSS/JS
- Must work by opening index.html directly in browser (no server needed for local dev)
  - Note: fetch() won't work from file:// in some browsers — add a note in README that a local server (e.g. `python3 -m http.server`) is needed, OR use an XHR fallback, OR inline the JSON as a JS variable

## Map behavior
- On load: `map.fitBounds()` to all stop coords with 40px padding
- Tiles: CartoDB Positron — `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- Route: straight dashed animated polylines between stops in order (NOT road routing)
  - Color of each segment = destination stop's `color` from JSON
  - Dash animation: CSS keyframe shifting stroke-dashoffset
- Markers: numbered circles (28px), white text, color from stop's `color` field in JSON

## Popups (two collapsible sections)
Section 1 (open by default):
- Stop name + flag + country
- Check-in → Check-out · N nights
- Drive from previous: Xh (estimate at 80km/h avg) / Y km
- Fuel cost for leg: computed as `Math.round((distance_km / 100) * constants.fuel_l_per_100km * constants.fuel_price_eur)`
- Campsite name + €X/night + total cost (price × nights)
- Pre-registration badge: "📋 Book in advance!" for yes/recommended, "🚪 Walk-in OK" for no
- Border crossing warning box (yellow bg) if `border` is not null
- Buttons: [📍 Google Maps] [🏕️ Campsite] (hide if campsite_url null) [📖 Wikivoyage]

Section 2 (collapsed, toggle "▶ Things to do + budget"):
- Kid highlight badge (emoji + text)
- Top 3 things (bulleted list)
- Estimated daily budget: ~€X/day
- Day trip note (if not null) — styled as a tip card
- Special note (if not null, e.g. birthday marker)

## Toggle toolbar (top-right, icon buttons with tooltips, all OFF by default)
- ⛽ Fuel costs: show/hide label on each route segment midpoint
  - Label: `⛽ ~€{computed}` 
- 🔥 LPG stations: fetch from Overpass API on toggle-on
  - URL: `https://overpass-api.de/api/interpreter`
  - POST query: `[out:json][timeout:25]; node["amenity"="fuel"]["fuel:lpg"="yes"](${south},${west},${north},${east}); out body;`
  - Bounding box: all stop coords + 0.5 degree padding
  - Render as small purple markers with popup showing name/address if available
- 🎂 Birthday countdown: show badge on each marker
  - Formula: `Math.max(0, Math.floor((new Date(meta.kid_birthday) - new Date(stop.check_in)) / 86400000))`
  - If days > 0: "🎂 {days} days to kid's 3rd!"
  - If days === 0: "🎂 TODAY is kid's 3rd! 🎉"
  - If days < 0: "🎂 Kid is 3! 🎉"
  - Zürich stop always shows 🎂 cake icon in marker regardless of toggle state

## Timeline bar (bottom of screen, always visible)
- Horizontal strip spanning May 8–29 (22 days)
- Each cell = 1 day, equal width, shows day number
- Cell background = color of the stop occupying that day
- Clicking a cell: panTo the stop + open its popup
- Zürich cells (May 17–20) show a small 🎂 icon
- On mobile: timeline stays at bottom, fixed height ~44px

## Sidebar (left, ~280px wide)
Shows:
- Trip title + date range
- Total distance, nights, people
- Computed totals: camping cost, fuel cost, vignettes, grand total
  - All computed from JSON constants + stop data — not hardcoded
- Warning boxes:
  - ⚠️ Buy Swiss vignette at vignette.ch before Lucerne!
  - ⚠️ Buy Austrian vignette at vignette.at before Innsbruck!
- Must-book list (stops where pre_reg is "yes" or "recommended")

## Mobile (<768px)
- Sidebar hidden by default → ☰ button top-left → opens as bottom sheet overlay
- Timeline stays at bottom (fixed)
- Toggle toolbar stays top-right

## Style
- Font: system-ui or `Inter` from Google Fonts CDN
- Sidebar: white bg, #333 text, subtle drop shadow
- Accent color: #e67e22 (warm orange)
- Popup max-width: 320px, max-height: 80vh with scroll
- Markers: 28px circle, white bold number, color from JSON
- Route line: 3px dashed, animated, color per segment
- Overall feel: warm, family trip, fun — not a business dashboard
