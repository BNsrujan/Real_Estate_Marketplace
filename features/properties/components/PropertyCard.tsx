import type { Property } from "@/types";
import Link from "next/link";

const TYPE_ICON: Record<Property["type"], string> = {
  house: "🏠",
  land: "🌱",
  apartment: "🏢",
  commercial: "🏗️",
};

interface PropertyCardProps {
  property: Property;
}

/**
 * Server component — no interactivity needed, renders static property info.
 */
export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <div
        style={{
          background: "rgba(0, 15, 35, 0.7)",
          border: "1px solid rgba(108, 207, 255, 0.2)",
          borderRadius: "12px",
          padding: "20px",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(108, 207, 255, 0.6)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 20px rgba(108, 207, 255, 0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "rgba(108, 207, 255, 0.2)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Type badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "20px" }}>{TYPE_ICON[property.type]}</span>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "#6ccfff",
              fontFamily: "Orbitron, sans-serif",
              textTransform: "uppercase",
            }}
          >
            {property.type}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            color: "#e6f7ff",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          {property.title}
        </h3>

        {/* District */}
        <p
          style={{
            color: "rgba(230, 247, 255, 0.5)",
            fontSize: "12px",
            marginBottom: "16px",
          }}
        >
          {property.district}, Karnataka
        </p>

        {/* Price + size */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p
              style={{
                color: "rgba(230, 247, 255, 0.4)",
                fontSize: "10px",
                marginBottom: "2px",
              }}
            >
              PRICE
            </p>
            <p style={{ color: "#9ef0c4", fontWeight: "700", fontSize: "15px" }}>
              ₹{property.price}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: "rgba(230, 247, 255, 0.4)",
                fontSize: "10px",
                marginBottom: "2px",
              }}
            >
              SIZE
            </p>
            <p style={{ color: "#e6f7ff", fontSize: "14px" }}>
              {property.size}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
