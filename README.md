# roadtrip-map

Interactive family road trip map for Wohnmobil May 2026.

## Stack
- Single `index.html` — Leaflet.js via unpkg CDN, CartoDB Positron tiles
- `data/trip.json` — all trip data, edit this to update stops/prices/notes
- No build step, no server needed — open `index.html` directly in browser

## Data
All trip data lives in `data/trip.json`. The HTML loads it at runtime via `fetch('./data/trip.json')`.

To update a stop: edit `data/trip.json` and refresh the browser.

## Features
- Interactive map with unique colored marker per stop
- Clickable popups: campsite info, booking links, top 3 things to do, daily budget, border crossing warnings
- Timeline bar at bottom (day-by-day, clickable)
- Toggle toolbar: ⛽ fuel costs | 🔥 LPG stations (live Overpass API) | 🎂 kid's birthday countdown
- Fuel cost computed from constants in JSON (not hardcoded)
- Mobile responsive: sidebar collapses to bottom sheet on <768px

## Trip Summary
- May 8–29, 2026 · 21 nights · ~2,135km
- Templin → Erfurt → Strasbourg → Freiburg → Lucerne → Zürich → Lindau → Innsbruck → Zillertal → Regensburg → Berlin
- Kid turns 3 on May 20 in Zürich 🎂
