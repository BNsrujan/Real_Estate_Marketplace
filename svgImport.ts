// Minimal svgImport stub used by legacy components.
// Returns a data-URL or a path placeholder for an SVG by name.
export default function renderSvg(name: string): string {
  // For now return an empty 1x1 transparent PNG data URI as placeholder.
  // Replace with real svg mapping as needed.
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9s0oKJkAAAAASUVORK5CYII=";
}
