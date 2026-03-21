import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchProperties,
  fetchPropertyById,
} from "@/features/properties/services/propertyService";

interface Props {
  params: Promise<{ id: string }>;
}

// Pre-generate routes for all known property IDs at build time
export async function generateStaticParams() {
  const properties = await fetchProperties();
  return properties.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchPropertyById(id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: `${property.type} in ${property.district} — ₹${property.price}`,
  };
}

const TYPE_ICON: Record<string, string> = {
  house: "🏠",
  land: "🌱",
  apartment: "🏢",
  commercial: "🏗️",
};

/**
 * Server component — fully static when used with generateStaticParams.
 */
export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  if (!property) notFound();

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 0%, #0b1230 0%, #050a1a 50%, #000000 100%)",
        padding: "40px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      `}</style>

      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href="/properties"
          style={{
            color: "rgba(108, 207, 255, 0.6)",
            fontSize: "12px",
            letterSpacing: "2px",
            fontFamily: "Orbitron, sans-serif",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← ALL PROPERTIES
        </Link>

        {/* Type badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "28px" }}>
            {TYPE_ICON[property.type] ?? "🏗️"}
          </span>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              color: "#6ccfff",
              fontFamily: "Orbitron, sans-serif",
              textTransform: "uppercase",
            }}
          >
            {property.type}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#e6f7ff",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: "700",
            letterSpacing: "4px",
            fontFamily: "Orbitron, sans-serif",
            textShadow: "0 0 20px rgba(108,207,255,0.3)",
            marginBottom: "8px",
          }}
        >
          {property.title}
        </h1>

        <p
          style={{
            color: "rgba(230,247,255,0.5)",
            fontSize: "14px",
            marginBottom: "40px",
          }}
        >
          {property.district}, Karnataka
        </p>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            { label: "PRICE", value: `₹${property.price}`, color: "#9ef0c4" },
            { label: "SIZE", value: property.size, color: "#e6f7ff" },
            { label: "DISTRICT", value: property.district, color: "#e6f7ff" },
            {
              label: "COORDINATES",
              value: `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`,
              color: "rgba(230,247,255,0.6)",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(0, 15, 35, 0.7)",
                border: "1px solid rgba(108, 207, 255, 0.15)",
                borderRadius: "12px",
                padding: "20px",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                style={{
                  color: "rgba(230,247,255,0.35)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                {label}
              </p>
              <p style={{ color, fontSize: "18px", fontWeight: "600" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Globe link */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            fontSize: "12px",
            letterSpacing: "2px",
            fontFamily: "Orbitron, sans-serif",
            color: "#dff6ff",
            border: "1.5px solid rgba(0,255,255,0.5)",
            borderRadius: "40px",
            textDecoration: "none",
            background: "rgba(0, 20, 40, 0.4)",
            backdropFilter: "blur(6px)",
          }}
        >
          VIEW ON GLOBE
        </Link>
      </div>
    </main>
  );
}
