// Centralised environment variable access.
// Import from here instead of accessing process.env directly in components.

export const env = {
  // Public API base — client and server safe
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  // Map tile base URL override (optional)
  mapStyleUrl: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "",
} as const;
