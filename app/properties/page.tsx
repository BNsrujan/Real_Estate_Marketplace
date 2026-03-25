// import type { Metadata } from "next";
// import Link from "next/link";
// import { fetchProperties } from "@/features/properties/services/propertyService";
// import { PropertyList } from "@/features/properties/components/PropertyList";

// export const metadata: Metadata = {
//   title: "Properties",
//   description: "Browse all properties listed on Namma Dharani.",
// };

// /**
//  * Server component — data is fetched at request time, no client JS needed.
//  */
// export default async function PropertiesPage() {
//   const properties = await fetchProperties();

//   return (
//     <main
//       style={{
//         minHeight: "100vh",
//         background:
//           "radial-gradient(ellipse at 50% 0%, #0b1230 0%, #050a1a 50%, #000000 100%)",
//         padding: "40px 24px",
//       }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
//       `}</style>

//       {/* Header */}
//       <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "40px",
//           }}
//         >
//           <div>
//             <Link
//               href="/"
//               style={{
//                 color: "rgba(108, 207, 255, 0.6)",
//                 fontSize: "12px",
//                 letterSpacing: "2px",
//                 fontFamily: "Orbitron, sans-serif",
//                 textDecoration: "none",
//                 display: "inline-block",
//                 marginBottom: "12px",
//               }}
//             >
//               ← GLOBE VIEW
//             </Link>
//             <h1
//               style={{
//                 color: "#e6f7ff",
//                 fontSize: "clamp(24px, 4vw, 40px)",
//                 fontWeight: "700",
//                 letterSpacing: "6px",
//                 fontFamily: "Orbitron, sans-serif",
//                 textShadow: "0 0 20px rgba(108,207,255,0.4)",
//               }}
//             >
//               PROPERTIES
//             </h1>
//             <p
//               style={{
//                 color: "rgba(230, 247, 255, 0.4)",
//                 marginTop: "8px",
//                 fontSize: "14px",
//               }}
//             >
//               {properties.length} listing{properties.length !== 1 ? "s" : ""}{" "}
//               across Karnataka
//             </p>
//           </div>
//         </div>

//         <PropertyList properties={properties} />
//       </div>
//     </main>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import { fetchProperties } from "@/features/properties/services/propertyService";
import { PropertyList } from "@/features/properties/components/PropertyList";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse all properties listed on Namma Dharani.",
};

export default async function PropertiesPage() {
  const properties = await fetchProperties();

  return (
    <main className="min-h-screen surface overflow-y-auto">
      {/* ── NAV ───────────────────────── */}
      <nav className="sticky top-0 z-50 glass px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="display text-sm flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
            N
          </span>
          NAMMA DHARANI
        </Link>

        <Link
          href="/"
          className="text-xs tracking-widest text-[var(--on-surface-variant)] uppercase hover:text-[var(--primary)] transition"
        >
          ← Globe View
        </Link>
      </nav>

      {/* ── HEADER ───────────────────── */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="label text-[var(--primary)] mb-2">
              Karnataka Real Estate
            </p>

            <h1 className="display text-3xl sm:text-5xl">All Properties</h1>
          </div>

          {/* COUNT CARD */}
          <div className="surface-low rounded-lg px-5 py-4 text-right shadow-sm">
            <div className="display text-2xl text-[var(--primary)]">
              {properties.length}
            </div>
            <div className="label mt-1">Active Listings</div>
          </div>
        </div>

        {/* RED LINE */}
        <div className="h-[2px] bg-gradient-to-r from-[var(--primary)] to-transparent mt-8 rounded" />
      </header>

      {/* ── GRID ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <PropertyList properties={properties} />
      </section>
    </main>
  );
}
