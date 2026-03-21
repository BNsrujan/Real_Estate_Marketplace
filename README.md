# Namma Dharani — Real Estate Marketplace

> "Discover Karnataka from Space"

A geospatial real estate marketplace for Karnataka, India. Built around an immersive 3D interactive globe, Namma Dharani lets users explore districts spatially, discover property markers at real coordinates, and drill into detailed listings — all from a map-first experience unlike traditional list-based portals.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data](#data)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

Namma Dharani ("Our Land" in Kannada) is a **map-first real estate discovery platform**. Instead of scrolling through paginated lists, users navigate a 3D globe, zoom into Karnataka, click glowing districts, and see property pins pulse at their exact geographic coordinates.

**Current State**: Frontend MVP with static data. Full backend, auth, and payment layers are planned.

---

## Live Demo

> Coming soon — deployment on Vercel pending.

---

## Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Framework   | Next.js 16 (App Router, React 19)        |
| Language    | TypeScript 5 (strict mode)               |
| 3D Map      | MapLibre GL 5 (globe projection)         |
| 3D Graphics | Three.js 0.182 + React Three Fiber       |
| Animations  | GSAP 3                                   |
| Styling     | Tailwind CSS 4 + inline styles           |
| Map Tiles   | ArcGIS Online (satellite, roads, labels) |
| Fonts       | Google Fonts — Inter, Orbitron          |
| Data        | Static JSON (public/data/)               |
| Hosting     | Vercel (recommended)                     |

---

## Project Structure

```
Real_Estate_Marketplace_Frontend/
├── app/
│   ├── page.tsx                        # Home — 3D globe experience
│   ├── layout.tsx                      # Root layout + Inter font
│   ├── globals.css                     # Global reset + Tailwind
│   └── properties/
│       ├── page.tsx                    # /properties — listing grid
│       └── [id]/
│           └── page.tsx               # /properties/[id] — detail (SSG)
├── components/
│   ├── loading/
│   │   └── LoadingScreen.tsx          # Orbital spinner, min 1800ms
│   ├── map/
│   │   ├── PropertyMarkers.tsx        # Pulsing map markers
│   │   └── DistrictInteraction.ts     # District click handler
│   ├── space/
│   │   └── StarField.tsx              # Three.js starfield background
│   └── ui/
│       └── startbtn.tsx               # "Explore Karnataka" CTA
├── features/
│   ├── geo/
│   │   └── services/
│   │       └── geoService.ts          # GeoJSON loaders
│   ├── map/
│   │   ├── components/
│   │   │   ├── MapCanvas.tsx          # Map orchestrator
│   │   │   └── MapCanvasLoader.tsx    # SSR-disabled wrapper
│   │   ├── hooks/
│   │   │   ├── useMapInstance.ts      # MapLibre lifecycle
│   │   │   ├── useMarkerSync.ts       # Marker + district filter
│   │   │   └── useDistrictZoom.ts     # Fly animations
│   │   └── services/
│   │       └── mapLayerService.ts     # GeoJSON layer config
│   └── properties/
│       ├── components/
│       │   ├── PropertyList.tsx       # Responsive card grid
│       │   └── PropertyCard.tsx       # Individual listing card
│       ├── hooks/
│       │   └── useProperties.ts       # Client-side fetching + filter
│       └── services/
│           └── propertyService.ts     # Property data API (static)
├── lib/
│   ├── env.ts                         # Environment variable access
│   └── globe/
│       └── mapConfig.ts               # Map center, zoom, projection
├── types/
│   └── index.ts                       # Property, District, City, MapViewState
└── public/
    └── data/
        ├── properties.json            # Listing database (6 properties)
        ├── cities.json                # District GeoJSON points
        ├── district-centers.json      # District center coordinates
        ├── karnataka.geojson          # Karnataka state boundary
        └── india.geojson             # India country boundary
```

---

## Features

### Globe & Map

- **3D globe rendering** with MapLibre globe projection
- **Satellite + road + label tile layers** from ArcGIS Online (no API key required)
- **Karnataka and India GeoJSON overlays** with cyan boundary lines
- **District polygons** with glow and zoom-dependent opacity
- **District labels** rendered on map at appropriate zoom levels
- **Smooth fly/zoom animations** using GSAP easing curves
- **Zoom-aware UI** — title fades, button appears/disappears based on zoom level

### Property Listings

- **Responsive property card grid** (auto-fill, 280px min columns)
- **Static property detail pages** generated at build time (SSG)
- **Type badges** — house, land, apartment, commercial with icons
- **District-based filtering** — click district → markers filter to that area
- **Pulsing property markers** on the globe at real lat/lng coordinates
- **Marker zoom-range visibility** — markers appear only between zoom 5.5 and 9
- **Marker → district filter** — clicking a marker zooms into its district

### Visual Experience

- **3D starfield background** — 7,000 procedurally placed stars (Three.js)
- **Mouse parallax** on the starfield
- **Orbital loading animation** — three concentric spinning rings
- **Space-themed color system** — cyan accents, deep black background

### Architecture

- **Next.js App Router** with server components + SSG
- **Feature-sliced structure** — features/, hooks/, services/ separation
- **SSR-disabled map wrapper** — MapLibre + Three.js require browser APIs
- **TypeScript strict mode** throughout

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/BNsrujan/Real_Estate_Marketplace_Frontend.git
cd Real_Estate_Marketplace_Frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create a `.env.local` file in the root:

```env
# Optional: Override the default API base URL
NEXT_PUBLIC_API_URL=

# Optional: Override the default MapLibre style URL
NEXT_PUBLIC_MAP_STYLE_URL=
```

Both variables are optional. The app runs fully on static data without them.

---

## Data

All data lives in `public/data/` and is served as static assets:

| File                      | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `properties.json`       | Property listings (id, title, type, price, size, lat, lng, district) |
| `cities.json`           | District center GeoJSON points                                       |
| `district-centers.json` | District center coordinates for fly animations                       |
| `karnataka.geojson`     | Karnataka state boundary polygon                                     |
| `india.geojson`         | India country boundary                                               |

### Property Schema

```typescript
interface Property {
  id: string;
  title: string;
  type: "house" | "land" | "apartment" | "commercial";
  price: string;    // e.g. "1.2 Cr", "35 Lakhs"
  size: string;     // e.g. "2400 sqft", "2 Acres"
  lat: number;
  lng: number;
  district: string;
}
```

To add properties, edit `public/data/properties.json` directly.

---

## Architecture

### Map Rendering Pipeline

```
page.tsx
  └── MapCanvasLoader (dynamic, ssr: false)
        └── MapCanvas (orchestrator)
              ├── useMapInstance    → creates MapLibre instance, adds layers
              ├── useMarkerSync     → fetches properties, manages markers
              └── useDistrictZoom  → fly animation helpers
```

### Data Flow

```
public/data/properties.json
  ├── propertyService.ts (server + client fetch)
  │     ├── /properties page (server, SSG)
  │     ├── /properties/[id] page (server, SSG)
  │     └── useProperties hook (client, filtered)
  └── useMarkerSync (client, map markers)
```

### Zoom Behavior

| Zoom Level | UI State                                      |
| ---------- | --------------------------------------------- |
| < 3        | Title "NAMMA DHARANI" visible                 |
| < 4        | "Explore Karnataka" button visible            |
| 3–5.5     | Karnataka overview, no markers                |
| 5.5–9     | Property markers visible                      |
| > 9        | Markers hidden (too zoomed in)                |
| 11.5       | District detail level (set on district click) |

---

## Roadmap

### Phase 2 — Core Product

- [ ] User authentication (email/OTP + Google OAuth)
- [ ] Property images (gallery per listing)
- [ ] Search bar with filters (price, size, type, district)
- [ ] Enquiry / contact form with lead capture
- [ ] Backend API + PostgreSQL database (Supabase)
- [ ] Admin panel (add/edit/delete listings)
- [ ] Favorites / saved listings

### Phase 3 — Growth

- [ ] Agent / seller dashboard
- [ ] Verified listings badge (RERA)
- [ ] Map clustering for high-density areas
- [ ] Price heatmap overlay by district
- [ ] EMI / mortgage calculator
- [ ] WhatsApp enquiry integration
- [ ] Analytics dashboard
- [ ] Kannada language support

### Phase 4 — Monetization

- [ ] Paid featured pins on globe
- [ ] Agent subscription tiers
- [ ] Lead management CRM
- [ ] Builder project landing pages
- [ ] NRI-targeted listing placement

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request against `dev`

---

**Namma Dharani** — Built with Next.js, MapLibre, and Three.js
