"use client";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
}

const MIN_DISPLAY_MS = 2200;

export default function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [progress, setProgress] = useState(0);

  // Fake progress bar that fills to ~85% then jumps to 100 on load
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(interval);
          return p;
        }
        return p + Math.random() * 6;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setProgress(100);

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const fadeTimer = setTimeout(() => setFading(true), remaining);
    const hideTimer = setTimeout(() => setVisible(false), remaining + 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoaded, startTime]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: fading ? "none" : "all",
        background:
          "radial-gradient(ellipse at 50% 40%, #060f2a 0%, #020510 50%, #000000 100%)",
        overflow: "hidden",
      }}
    >
      {/* Animated grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
          animation: "gridMove 8s linear infinite",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 65%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          position: "relative",
          width: "80px",
          height: "80px",
          marginBottom: "40px",
          zIndex: 1,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(56,189,248,0.15)",
            borderTopColor: "#38bdf8",
            animation: "spin 2s linear infinite",
          }}
        />
        {/* Mid ring */}
        <div
          style={{
            position: "absolute",
            inset: "12px",
            borderRadius: "50%",
            border: "1.5px solid rgba(99,210,255,0.1)",
            borderBottomColor: "#63d2ff",
            animation: "spin 1.4s linear infinite reverse",
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            borderRadius: "50%",
            border: "1.5px solid rgba(74,222,128,0.15)",
            borderLeftColor: "#4ade80",
            animation: "spin 0.9s linear infinite",
          }}
        />
        {/* Core */}
        <div
          style={{
            position: "absolute",
            inset: "35px",
            borderRadius: "50%",
            background: "#38bdf8",
            boxShadow: "0 0 12px #38bdf8, 0 0 24px #38bdf830",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          zIndex: 1,
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            fontSize: "clamp(20px, 4vw, 42px)",
            fontWeight: "900",
            letterSpacing: "12px",
            color: "#f0f9ff",
            fontFamily: "Orbitron, sans-serif",
            textShadow:
              "0 0 40px rgba(56,189,248,0.5), 0 0 80px rgba(56,189,248,0.2)",
            marginBottom: "6px",
          }}
        >
          NAMMA DHARANI
        </div>
        <div
          style={{
            color: "rgba(56,189,248,0.45)",
            fontSize: "10px",
            letterSpacing: "5px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "400",
          }}
        >
          KARNATAKA REAL ESTATE PLATFORM
        </div>
      </div>
      <div
        style={{
          zIndex: 1,
          width: "min(280px, 70vw)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            height: "2px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, #38bdf8, #63d2ff)",
              borderRadius: "2px",
              transition: "width 0.3s ease",
              boxShadow: "0 0 8px #38bdf8",
            }}
          />
        </div>
      </div>

      <div
        style={{
          zIndex: 1,
          color: "rgba(56,189,248,0.35)",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "9px",
          letterSpacing: "3px",
        }}
      >
        {progress < 100 ? "INITIALISING GLOBE..." : "READY"}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes gridMove {
          from { transform: translateY(0); }
          to { transform: translateY(60px); }
        }
      `}</style>
    </div>
  );
}
