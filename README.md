| Zoom | Meaning    |
| ---- | ---------- |
| 0    | World View |
| 3    | Country    |
| 5    | State      |
| 8    | City       |
| 12   | Streets    |
| 16+  | Buildings  |


rounded-3xl
border-3
border-white/20 backdrop-blur-md hover:border-white/30 transition

z-[-10] — StarField (Three.js earth/stars canvas) — Background
z-[1] — MapLibre map container
z-[5] — Title and UI elements
z-[10] — UI overlays (navbar, sidebar)
z-[9999] — Loading screen


features/map/components/MapCanvas.tsx