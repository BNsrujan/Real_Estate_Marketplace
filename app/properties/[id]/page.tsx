// import type { Metadata } from "next";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import {
//   fetchProperties,
//   fetchPropertyById,
// } from "@/features/properties/services/propertyService";

// interface Props {
//   params: Promise<{ id: string }>;
// }

// // Pre-generate routes for all known property IDs at build time
// export async function generateStaticParams() {
//   const properties = await fetchProperties();
//   return properties.map((p) => ({ id: p.id }));
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;
//   const property = await fetchPropertyById(id);
//   if (!property) return { title: "Property Not Found" };
//   return {
//     title: property.title,
//     description: `${property.type} in ${property.district} — ₹${property.price}`,
//   };
// }

// const TYPE_ICON: Record<string, string> = {
//   house: "🏠",
//   land: "🌱",
//   apartment: "🏢",
//   commercial: "🏗️",
// };

// /**
//  * Server component — fully static when used with generateStaticParams.
//  */
// export default async function PropertyDetailPage({ params }: Props) {
//   const { id } = await params;
//   const property = await fetchPropertyById(id);

//   if (!property) notFound();

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

//       <div style={{ maxWidth: "760px", margin: "0 auto" }}>
//         {/* Back link */}
//         <Link
//           href="/properties"
//           style={{
//             color: "rgba(108, 207, 255, 0.6)",
//             fontSize: "12px",
//             letterSpacing: "2px",
//             fontFamily: "Orbitron, sans-serif",
//             textDecoration: "none",
//             display: "inline-block",
//             marginBottom: "32px",
//           }}
//         >
//           ← ALL PROPERTIES
//         </Link>

//         {/* Type badge */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "10px",
//             marginBottom: "16px",
//           }}
//         >
//           <span style={{ fontSize: "28px" }}>
//             {TYPE_ICON[property.type] ?? "🏗️"}
//           </span>
//           <span
//             style={{
//               fontSize: "11px",
//               letterSpacing: "3px",
//               color: "#6ccfff",
//               fontFamily: "Orbitron, sans-serif",
//               textTransform: "uppercase",
//             }}
//           >
//             {property.type}
//           </span>
//         </div>

//         {/* Title */}
//         <h1
//           style={{
//             color: "#e6f7ff",
//             fontSize: "clamp(28px, 5vw, 48px)",
//             fontWeight: "700",
//             letterSpacing: "4px",
//             fontFamily: "Orbitron, sans-serif",
//             textShadow: "0 0 20px rgba(108,207,255,0.3)",
//             marginBottom: "8px",
//           }}
//         >
//           {property.title}
//         </h1>

//         <p
//           style={{
//             color: "rgba(230,247,255,0.5)",
//             fontSize: "14px",
//             marginBottom: "40px",
//           }}
//         >
//           {property.district}, Karnataka
//         </p>

//         {/* Stats grid */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "16px",
//             marginBottom: "40px",
//           }}
//         >
//           {[
//             { label: "PRICE", value: `₹${property.price}`, color: "#9ef0c4" },
//             { label: "SIZE", value: property.size, color: "#e6f7ff" },
//             { label: "DISTRICT", value: property.district, color: "#e6f7ff" },
//             {
//               label: "COORDINATES",
//               value: `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`,
//               color: "rgba(230,247,255,0.6)",
//             },
//           ].map(({ label, value, color }) => (
//             <div
//               key={label}
//               style={{
//                 background: "rgba(0, 15, 35, 0.7)",
//                 border: "1px solid rgba(108, 207, 255, 0.15)",
//                 borderRadius: "12px",
//                 padding: "20px",
//                 backdropFilter: "blur(8px)",
//               }}
//             >
//               <p
//                 style={{
//                   color: "rgba(230,247,255,0.35)",
//                   fontSize: "10px",
//                   letterSpacing: "2px",
//                   marginBottom: "8px",
//                   fontFamily: "Orbitron, sans-serif",
//                 }}
//               >
//                 {label}
//               </p>
//               <p style={{ color, fontSize: "18px", fontWeight: "600" }}>
//                 {value}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Globe link */}
//         <Link
//           href="/"
//           style={{
//             display: "inline-block",
//             padding: "14px 28px",
//             fontSize: "12px",
//             letterSpacing: "2px",
//             fontFamily: "Orbitron, sans-serif",
//             color: "#dff6ff",
//             border: "1.5px solid rgba(0,255,255,0.5)",
//             borderRadius: "40px",
//             textDecoration: "none",
//             background: "rgba(0, 20, 40, 0.4)",
//             backdropFilter: "blur(6px)",
//           }}
//         >
//           VIEW ON GLOBE
//         </Link>
//       </div>
//     </main>
//   );
// }

// import type { Metadata } from "next";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import {
//   fetchProperties,
//   fetchPropertyById,
// } from "@/features/properties/services/propertyService";

// interface Props {
//   params: Promise<{ id: string }>;
// }

// export async function generateStaticParams() {
//   const properties = await fetchProperties();
//   return properties.map((p) => ({ id: p.id }));
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;
//   const property = await fetchPropertyById(id);
//   if (!property) return { title: "Property Not Found" };
//   return {
//     title: property.title,
//     description: `${property.type} in ${property.district} — ₹${property.price}`,
//   };
// }

// const TYPE_LABEL: Record<string, string> = {
//   house: "RESIDENTIAL",
//   land: "LAND PARCEL",
//   apartment: "APARTMENT",
//   commercial: "COMMERCIAL",
// };

// const TYPE_DOT: Record<string, string> = {
//   house: "#22c55e",
//   land: "#ef4444",
//   apartment: "#3b82f6",
//   commercial: "#f59e0b",
// };

// export default async function PropertyDetailPage({ params }: Props) {
//   const { id } = await params;
//   const property = await fetchPropertyById(id);
//   if (!property) notFound();

//   const dot = TYPE_DOT[property.type] ?? "#888";

//   return (
//     <main
//       style={{
//         minHeight: "100vh",
//         background: "#fcf9f8",
//         overflowY: "auto",
//       }}
//     >
//       {/* ── Sticky Nav ── */}
//       <nav
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           background: "rgba(252,249,248,0.88)",
//           backdropFilter: "blur(16px)",
//           WebkitBackdropFilter: "blur(16px)",
//           borderBottom: "1px solid rgba(50,50,51,0.06)",
//           padding: "0 clamp(20px, 5vw, 60px)",
//           height: "64px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Link
//           href="/"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "10px",
//             textDecoration: "none",
//             color: "#323233",
//             fontFamily: "'Plus Jakarta Sans', sans-serif",
//             fontWeight: 700,
//             fontSize: "15px",
//           }}
//         >
//           <span
//             style={{
//               width: "28px",
//               height: "28px",
//               borderRadius: "6px",
//               background: "#c00015",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               fontSize: "14px",
//               fontWeight: 800,
//             }}
//           >
//             N
//           </span>
//           Namma Dharani
//         </Link>

//         <Link
//           href="/properties"
//           style={{
//             fontFamily: "'Manrope', sans-serif",
//             fontSize: "12px",
//             fontWeight: 700,
//             letterSpacing: "1.5px",
//             color: "#888",
//             textDecoration: "none",
//             textTransform: "uppercase",
//           }}
//         >
//           ← All Properties
//         </Link>
//       </nav>

//       <div
//         style={{
//           maxWidth: "900px",
//           margin: "0 auto",
//           padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 60px) 80px",
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       >
//         {/* ── Hero image placeholder ── */}
//         <div
//           style={{
//             width: "100%",
//             aspectRatio: "16/7",
//             background: "linear-gradient(135deg, #e4e2e2 0%, #f0eeee 100%)",
//             borderRadius: "8px",
//             marginBottom: "clamp(32px, 5vw, 48px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             overflow: "hidden",
//             position: "relative",
//           }}
//         >
//           <div
//             style={{
//               fontFamily: "'Plus Jakarta Sans', sans-serif",
//               fontSize: "clamp(3rem, 8vw, 6rem)",
//               opacity: 0.15,
//               userSelect: "none",
//             }}
//           >
//             {property.type === "house"
//               ? "🏠"
//               : property.type === "land"
//                 ? "🌱"
//                 : "🏗️"}
//           </div>
//           {/* Red accent corner */}
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "4px",
//               height: "60px",
//               background: "#c00015",
//               borderRadius: "0 0 2px 0",
//             }}
//           />
//         </div>

//         {/* ── Type badge + Title ── */}
//         <div style={{ marginBottom: "clamp(24px, 4vw, 40px)" }}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginBottom: "14px",
//             }}
//           >
//             <span
//               style={{
//                 width: "8px",
//                 height: "8px",
//                 borderRadius: "50%",
//                 background: dot,
//                 boxShadow: `0 0 8px ${dot}`,
//                 flexShrink: 0,
//               }}
//             />
//             <span
//               style={{
//                 fontFamily: "'Manrope', sans-serif",
//                 fontSize: "10px",
//                 fontWeight: 700,
//                 letterSpacing: "3px",
//                 color: "#888",
//                 textTransform: "uppercase",
//               }}
//             >
//               {TYPE_LABEL[property.type] ?? property.type}
//             </span>
//           </div>

//           <h1
//             style={{
//               fontFamily: "'Plus Jakarta Sans', sans-serif",
//               fontSize: "clamp(1.8rem, 5vw, 3rem)",
//               fontWeight: 800,
//               color: "#323233",
//               margin: "0 0 10px 0",
//               lineHeight: 1.15,
//               letterSpacing: "-0.5px",
//             }}
//           >
//             {property.title}
//           </h1>

//           <p
//             style={{
//               fontFamily: "'Manrope', sans-serif",
//               fontSize: "15px",
//               color: "#888",
//               margin: 0,
//             }}
//           >
//             📍 {property.district} District, Karnataka, India
//           </p>
//         </div>

//         {/* ── Stats grid ── */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns:
//               "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
//             gap: "1px",
//             background: "#e4e2e2",
//             borderRadius: "8px",
//             overflow: "hidden",
//             marginBottom: "clamp(32px, 5vw, 48px)",
//           }}
//         >
//           {[
//             {
//               label: "ASKING PRICE",
//               value: `₹${property.price}`,
//               highlight: true,
//             },
//             { label: "TOTAL AREA", value: property.size },
//             {
//               label: "PROPERTY TYPE",
//               value:
//                 property.type.charAt(0).toUpperCase() + property.type.slice(1),
//             },
//             { label: "DISTRICT", value: property.district },
//           ].map(({ label, value, highlight }) => (
//             <div
//               key={label}
//               style={{
//                 background: "#ffffff",
//                 padding: "clamp(16px, 3vw, 24px) clamp(20px, 3vw, 28px)",
//               }}
//             >
//               <div
//                 style={{
//                   fontFamily: "'Manrope', sans-serif",
//                   fontSize: "9px",
//                   fontWeight: 700,
//                   letterSpacing: "2.5px",
//                   color: "#aaa",
//                   textTransform: "uppercase",
//                   marginBottom: "8px",
//                 }}
//               >
//                 {label}
//               </div>
//               <div
//                 style={{
//                   fontFamily: "'Plus Jakarta Sans', sans-serif",
//                   fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
//                   fontWeight: 800,
//                   color: highlight ? "#c00015" : "#323233",
//                   lineHeight: 1.2,
//                 }}
//               >
//                 {value}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── Coordinates ── */}
//         <div
//           style={{
//             background: "#f5f3f2",
//             borderRadius: "6px",
//             padding: "clamp(16px, 3vw, 20px) clamp(20px, 3vw, 24px)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             flexWrap: "wrap",
//             gap: "12px",
//             marginBottom: "clamp(32px, 5vw, 48px)",
//           }}
//         >
//           <span
//             style={{
//               fontFamily: "'Manrope', sans-serif",
//               fontSize: "11px",
//               fontWeight: 700,
//               letterSpacing: "2px",
//               color: "#aaa",
//               textTransform: "uppercase",
//             }}
//           >
//             GPS Coordinates
//           </span>
//           <span
//             style={{
//               fontFamily: "monospace",
//               fontSize: "13px",
//               color: "#555",
//               letterSpacing: "0.5px",
//             }}
//           >
//             {property.lat.toFixed(4)}° N · {property.lng.toFixed(4)}° E
//           </span>
//         </div>

//         {/* ── CTAs ── */}
//         <div
//           style={{
//             display: "flex",
//             gap: "12px",
//             flexWrap: "wrap",
//           }}
//         >
//           <Link
//             href="/"
//             style={{
//               flex: "1 1 200px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               padding: "15px 28px",
//               background: "#c00015",
//               color: "#fff",
//               borderRadius: "6px",
//               textDecoration: "none",
//               fontFamily: "'Manrope', sans-serif",
//               fontSize: "13px",
//               fontWeight: 700,
//               letterSpacing: "1px",
//               transition: "background 0.2s, transform 0.2s",
//               boxShadow: "0 4px 20px rgba(192,0,21,0.3)",
//             }}
//           >
//             View on Globe →
//           </Link>

//           <Link
//             href="/properties"
//             style={{
//               flex: "1 1 200px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               padding: "15px 28px",
//               background: "#e4e2e2",
//               color: "#323233",
//               borderRadius: "6px",
//               textDecoration: "none",
//               fontFamily: "'Manrope', sans-serif",
//               fontSize: "13px",
//               fontWeight: 700,
//               letterSpacing: "1px",
//               transition: "background 0.2s",
//             }}
//           >
//             ← All Properties
//           </Link>
//         </div>
//       </div>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
//         * { box-sizing: border-box; }
//         html, body { overflow: auto !important; height: auto !important; }
//       `}</style>
//     </main>
//   );
// }
// import { notFound } from "next/navigation";
// import Link from "next/link";
// import { fetchPropertyById } from "@/features/properties/services/propertyService";

// export default async function PropertyDetailPage({ params }: any) {
//   const property = await fetchPropertyById(params.id);
//   if (!property) notFound();

//   return (
//     <main className="min-h-screen surface">
//       {/* NAV */}
//       <nav className="sticky top-0 z-50 glass px-6 h-16 flex items-center justify-between">
//         <Link href="/" className="display text-sm">
//           Namma Dharani
//         </Link>

//         <Link
//           href="/properties"
//           className="text-xs tracking-widest text-gray-500"
//         >
//           ← ALL PROPERTIES
//         </Link>
//       </nav>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
//         {/* HERO */}
//         <div className="aspect-[16/7] surface-low rounded-lg mb-10 flex items-center justify-center relative">
//           <div className="text-6xl opacity-20">🏠</div>
//           <div className="absolute left-0 top-0 w-1 h-16 bg-red-700" />
//         </div>

//         {/* TITLE */}
//         <div className="mb-10">
//           <p className="label mb-2">{property.type}</p>

//           <h1 className="display text-3xl sm:text-5xl mb-2">
//             {property.title}
//           </h1>

//           <p className="text-sm text-gray-500">
//             📍 {property.district}, Karnataka
//           </p>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-[var(--surface-high)] rounded-lg overflow-hidden mb-10">
//           {[
//             { label: "PRICE", value: `₹${property.price}` },
//             { label: "AREA", value: property.size },
//             { label: "TYPE", value: property.type },
//             { label: "DISTRICT", value: property.district },
//           ].map((item) => (
//             <div key={item.label} className="surface-top p-4">
//               <p className="label">{item.label}</p>
//               <p className="display text-lg mt-1">{item.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* CTA */}
//         <div className="flex flex-col sm:flex-row gap-4">
//           <Link
//             href="/"
//             className="flex-1 text-center bg-red-700 text-white py-3 rounded-md font-semibold"
//           >
//             View on Globe →
//           </Link>

//           <Link
//             href="/properties"
//             className="flex-1 text-center surface-low py-3 rounded-md font-semibold"
//           >
//             ← All Properties
//           </Link>
//         </div>
//       </div>
//     </main>
//   );
// }

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPropertyById } from "@/features/properties/services/propertyService";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await fetchPropertyById(id);
  if (!property) notFound();

  return (
    <main className="min-h-screen surface">
      {/* NAV */}
      <nav className="sticky top-0 z-50 glass px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="display text-sm">
          NAMMA DHARANI
        </Link>

        <Link
          href="/properties"
          className="text-xs tracking-widest text-gray-500"
        >
          ← ALL PROPERTIES
        </Link>
      </nav>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* HERO */}
        <div className="aspect-video surface-low rounded-lg mb-10 flex items-center justify-center relative">
          <div className="text-6xl opacity-20">
            {property.type === "house"
              ? "🏠"
              : property.type === "land"
                ? "🌱"
                : "🏢"}
          </div>

          <div className="absolute left-0 top-0 w-1 h-16 bg-red-700" />
        </div>

        {/* TITLE */}
        <div className="mb-10">
          <p className="label mb-2">{property.type}</p>

          <h1 className="display text-3xl sm:text-5xl mb-2">
            {property.title}
          </h1>

          <p className="text-sm text-gray-500">
            📍 {property.district}, Karnataka
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 rounded-lg overflow-hidden mb-10">
          {[
            { label: "PRICE", value: `₹${property.price}` },
            { label: "AREA", value: property.size },
            { label: "TYPE", value: property.type },
            { label: "DISTRICT", value: property.district },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4">
              <p className="label">{item.label}</p>
              <p className="display text-lg mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center bg-red-700 text-white py-3 rounded-md font-semibold"
          >
            View on Globe →
          </Link>

          <Link
            href="/properties"
            className="flex-1 text-center surface-low py-3 rounded-md font-semibold"
          >
            ← All Properties
          </Link>
        </div>
      </div>
    </main>
  );
}
