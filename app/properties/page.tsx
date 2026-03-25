import type { Metadata } from "next";
import Link from "next/link";
import { fetchProperties } from "@/features/properties/services/propertyService";
import { PropertyList } from "@/features/properties/components/PropertyList";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse all properties listed on Namma Dharani.",
};

/**
 * Server component — data is fetched at request time, no client JS needed.
 */
export default async function PropertiesPage() {
  const properties = await fetchProperties();

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

      {/* Header */}
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                color: "rgba(108, 207, 255, 0.6)",
                fontSize: "12px",
                letterSpacing: "2px",
                fontFamily: "Orbitron, sans-serif",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "12px",
              }}
            >
              ← GLOBE VIEW
            </Link>
            <h1
              style={{
                color: "#e6f7ff",
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: "700",
                letterSpacing: "6px",
                fontFamily: "Orbitron, sans-serif",
                textShadow: "0 0 20px rgba(108,207,255,0.4)",
              }}
            >
              PROPERTIES
            </h1>
            <p
              style={{
                color: "rgba(230, 247, 255, 0.4)",
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              {properties.length} listing{properties.length !== 1 ? "s" : ""}{" "}
              across Karnataka
            </p>
          </div>
        </div>

        <PropertyList properties={properties} />
      </div>
    </main>
  );
}
