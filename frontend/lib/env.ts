// Centralised environment variable access.
// Import from here instead of accessing process.env directly in components.
//
// How it works:
//   npm run dev   → Next.js loads .env.local  (NEXT_PUBLIC_API_URL=http://localhost:8000)
//   npm run build → Next.js loads .env.production (NEXT_PUBLIC_API_URL=https://your-backend.railway.app)
//   Vercel/host   → platform env vars override .env.production at build time

const isDev = process.env.NODE_ENV !== "production";

export const env = {
  // Backend API base URL — automatically switches between local and production
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? (isDev ? "http://localhost:8000" : ""),

  // Map tile base URL override (optional)
  mapStyleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "",
} as const;
