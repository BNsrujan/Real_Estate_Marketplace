// "use client";

// interface Props {
//   onClick: () => void;
// }

// export default function StartExploreButton({ onClick }: Props) {
//   return (
//     <div
//       onClick={onClick}
//       style={{
//         position: "absolute",
//         bottom: "200px",
//         left: "50%",
//         transform: "translateX(-50%)",
//         zIndex: 2,
//         cursor: "pointer",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         color: "#dff6ff",
//         fontFamily: "Orbitron",
//         letterSpacing: "2px",
//         fontSize: "11px",
//         opacity: 0.85,
//       }}
//     >
//       <div
//         style={{
//           width: "22px",
//           height: "36px",
//           border: "2px solid #dff6ff",
//           borderRadius: "20px",
//           marginTop: "8px",
//           position: "relative",
//         }}
//       >
//         <div
//           style={{
//             width: "4px",
//             height: "8px",
//             background: "#dff6ff",
//             borderRadius: "2px",
//             position: "absolute",
//             top: "6px",
//             left: "50%",
//             transform: "translateX(-50%)",
//             animation: "scrollAnim 1.6s infinite",
//           }}
//         />
//       </div>
//       <style>{`
//         @keyframes scrollAnim {
//           0% { opacity: 0; transform: translate(-50%,0); }
//           40% { opacity: 1; }
//           80% { transform: translate(-50%,12px); opacity: 0; }
//           100% { opacity:0 }
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";

interface Props {
  onClick: () => void;
}

export default function StartExploreButton({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "120px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        cursor: "pointer",
      }}
    >
      <div className="explore-btn">Explore Karnataka</div>

      <style>{`
        .explore-btn {
          padding: 14px 28px;
          font-size: 14px;
          letter-spacing: 2px;
          font-family: Orbitron, sans-serif;
          color: #dff6ff;
          border: 1.5px solid rgba(0,255,255,0.6);
          border-radius: 40px;
          backdrop-filter: blur(6px);
          background: rgba(0, 20, 40, 0.4);
          box-shadow:
            0 0 12px rgba(0,255,255,0.4),
            inset 0 0 10px rgba(0,255,255,0.2);
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .explore-btn:hover {
          transform: scale(1.08);
          box-shadow:
            0 0 25px rgba(0,255,255,0.8),
            inset 0 0 15px rgba(0,255,255,0.4);
          background: rgba(0, 30, 60, 0.6);
        }

        .explore-btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}
