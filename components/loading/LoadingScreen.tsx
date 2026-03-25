"use client";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
}

const MIN_DISPLAY_MS = 3000; // ⬅️ increased for mobile

export default function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [progress, setProgress] = useState(0);

  // Fake progress
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
        position: "fixed", // ✅ FIXED
        top: 0, // ✅ FIXED
        left: 0, // ✅ FIXED
        width: "100vw",
        height: "100vh",
        zIndex: 9999999, // ✅ VERY IMPORTANT
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
      {/* grid */}
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

      {/* glow */}
      <div
        style={{
          position: "absolute",
          width: "300px", // ⬅️ reduced for mobile
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 65%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />

      {/* spinner */}
      <div style={{ width: 70, height: 70, marginBottom: 30 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "2px solid rgba(56,189,248,0.2)",
            borderTopColor: "#38bdf8",
            animation: "spin 1.2s linear infinite",
          }}
        />
      </div>

      {/* title */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            fontSize: "clamp(18px, 5vw, 36px)",
            letterSpacing: "6px", // ⬅️ FIX mobile overflow
            color: "#f0f9ff",
            fontFamily: "Orbitron",
          }}
        >
          NAMMA DHARANI
        </div>
      </div>

      {/* progress */}
      <div style={{ width: "70%", maxWidth: 260 }}>
        <div style={{ height: 2, background: "#111" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#38bdf8",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100%{transform:scale(1);opacity:0.6;}
          50%{transform:scale(1.1);opacity:1;}
        }
        @keyframes gridMove {
          from { transform: translateY(0); }
          to { transform: translateY(60px); }
        }
      `}</style>
    </div>
  );
}
