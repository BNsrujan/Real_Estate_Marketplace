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
        bottom: "40px",
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
