"use client";
interface Props {
  onClick: () => void;
}

export default function StartExploreButton({ onClick }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: window.innerWidth < 768 ? "24px" : "48px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "0 16px",
      }}
      onClick={onClick}
    >
      <button className="explore-btn">
        <span className="explore-icon">◎</span>
        <span className="explore-text">EXPLORE KARNATAKA</span>
        <span className="explore-arrow">→</span>
      </button>

      <div
        style={{
          color: "rgba(56,189,248,0.3)",
          fontSize: "9px",
          letterSpacing: "3px",
          fontFamily: "Orbitron, sans-serif",
          animation: "bobUp 2s ease-in-out infinite",
        }}
      >
        SCROLL OR CLICK TO BEGIN
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .explore-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          font-family: Orbitron, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #f0f9ff;
          background: linear-gradient(135deg, rgba(6,18,42,0.9), rgba(2,10,28,0.95));
          border: 1px solid rgba(56,189,248,0.35);
          border-radius: 50px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow:
            0 0 0 1px rgba(56,189,248,0.1),
            0 8px 32px rgba(0,0,0,0.4),
            0 0 24px rgba(56,189,248,0.08),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .explore-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(56,189,248,0.12), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .explore-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: sheen 4s ease-in-out infinite;
        }

        .explore-btn:hover {
          transform: translateY(-2px) scale(1.03);
          border-color: rgba(56,189,248,0.7);
          box-shadow:
            0 0 0 1px rgba(56,189,248,0.25),
            0 12px 40px rgba(0,0,0,0.5),
            0 0 40px rgba(56,189,248,0.2),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .explore-btn:hover::before { opacity: 1; }

        .explore-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .explore-icon {
          font-size: 16px;
          color: #38bdf8;
          animation: iconPulse 2s ease-in-out infinite;
          line-height: 1;
        }

        .explore-text { position: relative; z-index: 1; }

        .explore-arrow {
          color: rgba(56,189,248,0.6);
          transition: transform 0.3s, color 0.3s;
          font-size: 14px;
        }

        .explore-btn:hover .explore-arrow {
          transform: translateX(3px);
          color: #38bdf8;
        }

        @keyframes sheen {
          0% { left: -60%; }
          50%, 100% { left: 120%; }
        }

        @keyframes iconPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes bobUp {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
