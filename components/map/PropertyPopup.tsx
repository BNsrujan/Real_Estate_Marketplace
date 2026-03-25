// // "use client";

// // import { useEffect, useRef } from "react";
// // import type { Property } from "@/types";

// // const TYPE_ICON: Record<string, string> = {
// //   house: "🏠",
// //   land: "🌱",
// //   apartment: "🏢",
// //   commercial: "🏗️",
// // };

// // const TYPE_COLOR: Record<string, string> = {
// //   house: "#9ef0c4",
// //   land: "#ffd580",
// //   apartment: "#6ccfff",
// //   commercial: "#ff8fa3",
// // };

// // interface PropertyPopupProps {
// //   property: Property | null;
// //   onClose: () => void;
// // }

// // export default function PropertyPopup({
// //   property,
// //   onClose,
// // }: PropertyPopupProps) {
// //   const visible = property !== null;
// //   const prevProp = useRef<Property | null>(null);

// //   // Keep the last property in ref so the slide-down animation
// //   // still renders content while fading out
// //   if (property) prevProp.current = property;
// //   const display = property ?? prevProp.current;

// //   // Close on Escape key
// //   useEffect(() => {
// //     const onKey = (e: KeyboardEvent) => {
// //       if (e.key === "Escape") onClose();
// //     };
// //     window.addEventListener("keydown", onKey);
// //     return () => window.removeEventListener("keydown", onKey);
// //   }, [onClose]);

// //   if (!display) return null;

// //   const accentColor = TYPE_COLOR[display.type] ?? "#6ccfff";

// //   return (
// //     <>
// //       {/* Scrim — tap outside to close, does NOT block map scroll */}
// //       <div
// //         onClick={onClose}
// //         style={{
// //           position: "fixed",
// //           inset: 0,
// //           zIndex: 50,
// //           // transparent — just a click target
// //           background: "transparent",
// //           pointerEvents: visible ? "all" : "none",
// //         }}
// //       />

// //       {/* Bottom Sheet */}
// //       <div
// //         style={{
// //           position: "fixed",
// //           bottom: 0,
// //           left: "50%",
// //           transform: `translateX(-50%) translateY(${visible ? "0" : "110%"})`,
// //           width: "min(480px, 96vw)",
// //           zIndex: 51,
// //           transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
// //           borderRadius: "20px 20px 0 0",
// //           overflow: "hidden",
// //           // Glassmorphism
// //           background: "rgba(4, 14, 32, 0.88)",
// //           border: "1px solid rgba(108, 207, 255, 0.18)",
// //           borderBottom: "none",
// //           backdropFilter: "blur(20px)",
// //           WebkitBackdropFilter: "blur(20px)",
// //           boxShadow: `0 -8px 40px rgba(0,0,0,0.6), 0 -2px 0 ${accentColor}44`,
// //         }}
// //       >
// //         {/* Drag handle */}
// //         <div
// //           style={{
// //             width: "40px",
// //             height: "4px",
// //             borderRadius: "2px",
// //             background: "rgba(108,207,255,0.3)",
// //             margin: "12px auto 0",
// //           }}
// //         />

// //         {/* Content */}
// //         <div style={{ padding: "20px 24px 28px" }}>
// //           {/* Header row */}
// //           <div
// //             style={{
// //               display: "flex",
// //               alignItems: "flex-start",
// //               justifyContent: "space-between",
// //               marginBottom: "16px",
// //             }}
// //           >
// //             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
// //               <span style={{ fontSize: "26px" }}>
// //                 {TYPE_ICON[display.type] ?? "🏗️"}
// //               </span>
// //               <div>
// //                 <p
// //                   style={{
// //                     color: accentColor,
// //                     fontSize: "10px",
// //                     letterSpacing: "2.5px",
// //                     fontFamily: "Orbitron, sans-serif",
// //                     textTransform: "uppercase",
// //                     marginBottom: "3px",
// //                   }}
// //                 >
// //                   {display.type}
// //                 </p>
// //                 <h2
// //                   style={{
// //                     color: "#e6f7ff",
// //                     fontSize: "clamp(15px, 3vw, 20px)",
// //                     fontWeight: "700",
// //                     fontFamily: "Orbitron, sans-serif",
// //                     letterSpacing: "1px",
// //                     textShadow: `0 0 14px ${accentColor}55`,
// //                     margin: 0,
// //                   }}
// //                 >
// //                   {display.title}
// //                 </h2>
// //               </div>
// //             </div>

// //             {/* Close button */}
// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 onClose();
// //               }}
// //               style={{
// //                 background: "rgba(108,207,255,0.1)",
// //                 border: "1px solid rgba(108,207,255,0.2)",
// //                 borderRadius: "50%",
// //                 width: "32px",
// //                 height: "32px",
// //                 display: "flex",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 cursor: "pointer",
// //                 color: "rgba(230,247,255,0.7)",
// //                 fontSize: "16px",
// //                 flexShrink: 0,
// //                 transition: "background 0.2s",
// //               }}
// //               onMouseEnter={(e) =>
// //                 ((e.currentTarget as HTMLButtonElement).style.background =
// //                   "rgba(108,207,255,0.22)")
// //               }
// //               onMouseLeave={(e) =>
// //                 ((e.currentTarget as HTMLButtonElement).style.background =
// //                   "rgba(108,207,255,0.1)")
// //               }
// //             >
// //               ✕
// //             </button>
// //           </div>

// //           {/* District tag */}
// //           <p
// //             style={{
// //               color: "rgba(230,247,255,0.45)",
// //               fontSize: "12px",
// //               marginBottom: "18px",
// //               letterSpacing: "0.5px",
// //             }}
// //           >
// //             📍 {display.district}, Karnataka
// //           </p>

// //           {/* Stats row */}
// //           <div
// //             style={{
// //               display: "grid",
// //               gridTemplateColumns: "1fr 1fr",
// //               gap: "10px",
// //               marginBottom: "20px",
// //             }}
// //           >
// //             {[
// //               { label: "PRICE", value: `₹${display.price}`, color: "#9ef0c4" },
// //               { label: "SIZE", value: display.size, color: "#e6f7ff" },
// //             ].map(({ label, value, color }) => (
// //               <div
// //                 key={label}
// //                 style={{
// //                   background: "rgba(0,15,35,0.6)",
// //                   border: "1px solid rgba(108,207,255,0.12)",
// //                   borderRadius: "10px",
// //                   padding: "12px 14px",
// //                 }}
// //               >
// //                 <p
// //                   style={{
// //                     color: "rgba(230,247,255,0.35)",
// //                     fontSize: "9px",
// //                     letterSpacing: "2px",
// //                     fontFamily: "Orbitron, sans-serif",
// //                     marginBottom: "5px",
// //                   }}
// //                 >
// //                   {label}
// //                 </p>
// //                 <p style={{ color, fontSize: "16px", fontWeight: "700" }}>
// //                   {value}
// //                 </p>
// //               </div>
// //             ))}
// //           </div>

// //           {/* View Details button */}
// //           <a
// //             href={`/properties/${display.id}`}
// //             onClick={(e) => e.stopPropagation()}
// //             style={{
// //               display: "block",
// //               textAlign: "center",
// //               padding: "13px",
// //               fontSize: "11px",
// //               letterSpacing: "2.5px",
// //               fontFamily: "Orbitron, sans-serif",
// //               color: "#dff6ff",
// //               border: `1.5px solid ${accentColor}88`,
// //               borderRadius: "40px",
// //               textDecoration: "none",
// //               background: `linear-gradient(135deg, rgba(0,20,40,0.5), rgba(0,30,60,0.5))`,
// //               boxShadow: `0 0 16px ${accentColor}22`,
// //               transition: "box-shadow 0.25s, border-color 0.25s",
// //             }}
// //             onMouseEnter={(e) => {
// //               (e.currentTarget as HTMLAnchorElement).style.boxShadow =
// //                 `0 0 28px ${accentColor}55`;
// //               (e.currentTarget as HTMLAnchorElement).style.borderColor =
// //                 accentColor;
// //             }}
// //             onMouseLeave={(e) => {
// //               (e.currentTarget as HTMLAnchorElement).style.boxShadow =
// //                 `0 0 16px ${accentColor}22`;
// //               (e.currentTarget as HTMLAnchorElement).style.borderColor =
// //                 `${accentColor}88`;
// //             }}
// //           >
// //             VIEW FULL DETAILS →
// //           </a>
// //         </div>

// //         <style>{`
// //           @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
// //         `}</style>
// //       </div>
// //     </>
// //   );
// // }
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import type { Property } from "@/types";

// const TYPE_ICON: Record<string, string> = {
//   house: "🏠",
//   land: "🌱",
//   apartment: "🏢",
//   commercial: "🏗️",
// };

// const TYPE_COLOR: Record<string, string> = {
//   house: "#9ef0c4",
//   land: "#ffd580",
//   apartment: "#6ccfff",
//   commercial: "#ff8fa3",
// };

// interface PropertyPopupProps {
//   property: Property | null;
//   onClose: () => void;
// }

// export default function PropertyPopup({
//   property,
//   onClose,
// }: PropertyPopupProps) {
//   const visible = property !== null;
//   const prevProp = useRef<Property | null>(null);
//   const [mounted, setMounted] = useState(false);

//   // Portal needs document — only available client-side
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Keep last property so slide-down animation still shows content
//   if (property) prevProp.current = property;
//   const display = property ?? prevProp.current;

//   // Close on Escape
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);

//   if (!mounted || !display) return null;

//   const accentColor = TYPE_COLOR[display.type] ?? "#6ccfff";

//   const popup = (
//     <>
//       {/* Invisible scrim — click outside to close */}
//       {visible && (
//         <div
//           onClick={onClose}
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 9998,
//             background: "transparent",
//             cursor: "default",
//           }}
//         />
//       )}

//       {/* Bottom Sheet */}
//       <div
//         style={{
//           position: "fixed",
//           bottom: 0,
//           left: "50%",
//           transform: `translateX(-50%) translateY(${visible ? "0%" : "110%"})`,
//           width: "min(480px, 96vw)",
//           zIndex: 9999,
//           transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
//           borderRadius: "20px 20px 0 0",
//           overflow: "hidden",
//           background: "rgba(4, 14, 32, 0.92)",
//           border: "1px solid rgba(108, 207, 255, 0.22)",
//           borderBottom: "none",
//           backdropFilter: "blur(24px)",
//           WebkitBackdropFilter: "blur(24px)",
//           boxShadow: `0 -8px 48px rgba(0,0,0,0.7), 0 -2px 0 ${accentColor}55`,
//         }}
//       >
//         {/* Drag handle */}
//         <div
//           style={{
//             width: "40px",
//             height: "4px",
//             borderRadius: "2px",
//             background: "rgba(108,207,255,0.25)",
//             margin: "14px auto 0",
//           }}
//         />

//         <div style={{ padding: "20px 24px 32px" }}>
//           {/* Header */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               justifyContent: "space-between",
//               marginBottom: "14px",
//             }}
//           >
//             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//               <span style={{ fontSize: "28px", lineHeight: 1 }}>
//                 {TYPE_ICON[display.type] ?? "🏗️"}
//               </span>
//               <div>
//                 <p
//                   style={{
//                     color: accentColor,
//                     fontSize: "9px",
//                     letterSpacing: "3px",
//                     fontFamily: "Orbitron, sans-serif",
//                     textTransform: "uppercase",
//                     margin: "0 0 4px 0",
//                   }}
//                 >
//                   {display.type}
//                 </p>
//                 <h2
//                   style={{
//                     color: "#e6f7ff",
//                     fontSize: "clamp(15px, 3vw, 20px)",
//                     fontWeight: "700",
//                     fontFamily: "Orbitron, sans-serif",
//                     letterSpacing: "1px",
//                     textShadow: `0 0 14px ${accentColor}66`,
//                     margin: 0,
//                   }}
//                 >
//                   {display.title}
//                 </h2>
//               </div>
//             </div>

//             {/* Close */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose();
//               }}
//               style={{
//                 background: "rgba(108,207,255,0.08)",
//                 border: "1px solid rgba(108,207,255,0.2)",
//                 borderRadius: "50%",
//                 width: "34px",
//                 height: "34px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: "pointer",
//                 color: "rgba(230,247,255,0.6)",
//                 fontSize: "15px",
//                 flexShrink: 0,
//                 transition: "background 0.2s, color 0.2s",
//               }}
//               onMouseEnter={(e) => {
//                 const btn = e.currentTarget as HTMLButtonElement;
//                 btn.style.background = "rgba(108,207,255,0.2)";
//                 btn.style.color = "#e6f7ff";
//               }}
//               onMouseLeave={(e) => {
//                 const btn = e.currentTarget as HTMLButtonElement;
//                 btn.style.background = "rgba(108,207,255,0.08)";
//                 btn.style.color = "rgba(230,247,255,0.6)";
//               }}
//             >
//               ✕
//             </button>
//           </div>

//           {/* District */}
//           <p
//             style={{
//               color: "rgba(230,247,255,0.4)",
//               fontSize: "12px",
//               margin: "0 0 18px 0",
//               letterSpacing: "0.3px",
//             }}
//           >
//             📍 {display.district}, Karnataka
//           </p>

//           {/* Stats */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "10px",
//               marginBottom: "20px",
//             }}
//           >
//             {[
//               { label: "PRICE", value: `₹${display.price}`, color: "#9ef0c4" },
//               { label: "SIZE", value: display.size, color: "#e6f7ff" },
//             ].map(({ label, value, color }) => (
//               <div
//                 key={label}
//                 style={{
//                   background: "rgba(0,12,28,0.7)",
//                   border: "1px solid rgba(108,207,255,0.1)",
//                   borderRadius: "10px",
//                   padding: "12px 14px",
//                 }}
//               >
//                 <p
//                   style={{
//                     color: "rgba(230,247,255,0.3)",
//                     fontSize: "9px",
//                     letterSpacing: "2px",
//                     fontFamily: "Orbitron, sans-serif",
//                     margin: "0 0 5px 0",
//                   }}
//                 >
//                   {label}
//                 </p>
//                 <p
//                   style={{
//                     color,
//                     fontSize: "17px",
//                     fontWeight: "700",
//                     margin: 0,
//                   }}
//                 >
//                   {value}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* CTA */}
//           <a
//             href={`/properties/${display.id}`}
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               display: "block",
//               textAlign: "center",
//               padding: "13px",
//               fontSize: "11px",
//               letterSpacing: "2.5px",
//               fontFamily: "Orbitron, sans-serif",
//               color: "#dff6ff",
//               border: `1.5px solid ${accentColor}77`,
//               borderRadius: "40px",
//               textDecoration: "none",
//               background: "rgba(0,20,45,0.5)",
//               boxShadow: `0 0 18px ${accentColor}1a`,
//               transition: "all 0.25s",
//             }}
//             onMouseEnter={(e) => {
//               const a = e.currentTarget as HTMLAnchorElement;
//               a.style.boxShadow = `0 0 32px ${accentColor}55`;
//               a.style.borderColor = accentColor;
//               a.style.background = "rgba(0,30,60,0.65)";
//             }}
//             onMouseLeave={(e) => {
//               const a = e.currentTarget as HTMLAnchorElement;
//               a.style.boxShadow = `0 0 18px ${accentColor}1a`;
//               a.style.borderColor = `${accentColor}77`;
//               a.style.background = "rgba(0,20,45,0.5)";
//             }}
//           >
//             VIEW FULL DETAILS →
//           </a>
//         </div>

//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
//         `}</style>
//       </div>
//     </>
//   );

//   // Portal renders into document.body — escapes overflow:hidden on html/body
//   return createPortal(popup, document.body);
// }
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Property } from "@/types";

const TYPE_ICON: Record<string, string> = {
  house: "🏠",
  land: "🌱",
  apartment: "🏢",
  commercial: "🏗️",
};

const TYPE_COLOR: Record<string, string> = {
  house: "#4ade80",
  land: "#facc15",
  apartment: "#38bdf8",
  commercial: "#fb923c",
};

const TYPE_LABEL: Record<string, string> = {
  house: "RESIDENTIAL",
  land: "LAND",
  apartment: "APARTMENT",
  commercial: "COMMERCIAL",
};

interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyPopup({
  property,
  onClose,
}: PropertyPopupProps) {
  const [mounted, setMounted] = useState(false);
  const prevProp = useRef<Property | null>(null);
  const visible = property !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (property) prevProp.current = property;
  const display = property ?? prevProp.current;

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  if (!mounted || !display) return null;

  const accent = TYPE_COLOR[display.type] ?? "#38bdf8";

  return createPortal(
    <>
      {/* ── Backdrop scrim ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99990,
          background: visible
            ? "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)"
            : "transparent",
          transition: "background 0.4s ease",
          pointerEvents: visible ? "all" : "none",
        }}
      />

      {/* ── Bottom Sheet ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: `translateX(-50%) translateY(${visible ? "0px" : "calc(100% + 20px)"})`,
          width: "min(520px, 100vw)",
          zIndex: 99999,
          transition: "transform 0.42s cubic-bezier(0.34, 1.2, 0.64, 1)",
          willChange: "transform",
          // Glass panel
          background:
            "linear-gradient(160deg, rgba(6,18,42,0.97) 0%, rgba(2,8,22,0.98) 100%)",
          borderTop: `1px solid ${accent}40`,
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "24px 24px 0 0",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: `
            0 -1px 0 ${accent}30,
            0 -20px 60px rgba(0,0,0,0.8),
            0 -4px 24px ${accent}12,
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
          overflow: "hidden",
        }}
      >
        {/* Accent top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Drag pill */}
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.12)",
            margin: "16px auto 0",
          }}
        />

        <div style={{ padding: "18px 24px 36px" }}>
          {/* ── Top row: icon + title + close ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: `${accent}18`,
                border: `1px solid ${accent}35`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flexShrink: 0,
                boxShadow: `0 0 20px ${accent}15`,
              }}
            >
              {TYPE_ICON[display.type] ?? "🏗️"}
            </div>

            {/* Title block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: `${accent}15`,
                  border: `1px solid ${accent}30`,
                  borderRadius: "20px",
                  padding: "3px 10px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: accent,
                    boxShadow: `0 0 6px ${accent}`,
                  }}
                />
                <span
                  style={{
                    color: accent,
                    fontSize: "9px",
                    letterSpacing: "2px",
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: "700",
                  }}
                >
                  {TYPE_LABEL[display.type] ?? display.type.toUpperCase()}
                </span>
              </div>

              <h2
                style={{
                  color: "#f0f9ff",
                  fontSize: "clamp(16px, 4vw, 22px)",
                  fontWeight: "700",
                  fontFamily: "Orbitron, sans-serif",
                  letterSpacing: "0.5px",
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: `0 0 20px ${accent}30`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {display.title}
              </h2>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget;
                b.style.background = "rgba(255,255,255,0.12)";
                b.style.color = "#fff";
                b.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget;
                b.style.background = "rgba(255,255,255,0.05)";
                b.style.color = "rgba(255,255,255,0.5)";
                b.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              ✕
            </button>
          </div>

          {/* ── Location row ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "20px",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ fontSize: "13px" }}>📍</span>
            <span
              style={{
                color: "rgba(224,242,254,0.55)",
                fontSize: "12px",
                letterSpacing: "0.3px",
              }}
            >
              {display.district} District, Karnataka, India
            </span>
          </div>

          {/* ── Stats cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[
              {
                label: "ASKING PRICE",
                value: `₹${display.price}`,
                icon: "💰",
                color: "#4ade80",
                bg: "rgba(74,222,128,0.06)",
                border: "rgba(74,222,128,0.15)",
              },
              {
                label: "TOTAL AREA",
                value: display.size,
                icon: "📐",
                color: "#e0f2fe",
                bg: "rgba(224,242,254,0.04)",
                border: "rgba(224,242,254,0.08)",
              },
            ].map(({ label, value, icon, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: "14px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{icon}</span>
                  <p
                    style={{
                      color: "rgba(224,242,254,0.3)",
                      fontSize: "8px",
                      letterSpacing: "2px",
                      fontFamily: "Orbitron, sans-serif",
                      margin: 0,
                      fontWeight: "700",
                    }}
                  >
                    {label}
                  </p>
                </div>
                <p
                  style={{
                    color,
                    fontSize: "18px",
                    fontWeight: "800",
                    margin: 0,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Coordinates row ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.05)",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                color: "rgba(224,242,254,0.25)",
                fontSize: "9px",
                letterSpacing: "2px",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              COORDINATES
            </span>
            <span
              style={{
                color: "rgba(224,242,254,0.4)",
                fontSize: "11px",
                fontFamily: "monospace",
                letterSpacing: "0.5px",
              }}
            >
              {display.lat.toFixed(4)}°N · {display.lng.toFixed(4)}°E
            </span>
          </div>

          {/* ── CTA Button ── */}
          <a
            href={`/properties/${display.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "15px",
              fontSize: "11px",
              letterSpacing: "2.5px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "700",
              color: "#000c1a",
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              borderRadius: "14px",
              textDecoration: "none",
              boxShadow: `0 4px 24px ${accent}40, 0 0 0 1px ${accent}50`,
              transition: "all 0.25s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const a = e.currentTarget;
              a.style.transform = "translateY(-1px)";
              a.style.boxShadow = `0 8px 32px ${accent}60, 0 0 0 1px ${accent}80`;
            }}
            onMouseLeave={(e) => {
              const a = e.currentTarget;
              a.style.transform = "translateY(0)";
              a.style.boxShadow = `0 4px 24px ${accent}40, 0 0 0 1px ${accent}50`;
            }}
          >
            VIEW FULL DETAILS
            <span style={{ fontSize: "14px" }}>→</span>
          </a>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        `}</style>
      </div>
    </>,
    document.body,
  );
}
