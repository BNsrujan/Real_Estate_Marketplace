import type { Property } from "@/types";
import { PropertyCard } from "./PropertyCard";

interface PropertyListProps {
  properties: Property[];
}

/**
 * Server component — pure layout, no state.
 */
export function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <p
        style={{
          color: "rgba(230, 247, 255, 0.4)",
          textAlign: "center",
          paddingTop: "48px",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "13px",
          letterSpacing: "2px",
        }}
      >
        NO PROPERTIES FOUND
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
