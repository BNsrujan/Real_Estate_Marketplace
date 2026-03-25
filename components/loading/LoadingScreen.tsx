"use client";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
}

const MIN_DISPLAY_MS = 1800;

export default function LoadingScreen({ isLoaded }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isLoaded) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, remaining);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, remaining + 900);

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
        backgroundColor: "#000814",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Ambient glow behind spinner */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(58,167,255,0.08) 0%, transparent 70%)",
          animation: "ambientPulse 3s ease-in-out infinite",
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: "clamp(22px, 4.5vw, 52px)",
          fontWeight: "700",
          letterSpacing: "10px",
          color: "#f2fbff",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 6px #a6e1ff, 0 0 18px #6ccfff, 0 0 35px #3aa7ff",
          marginBottom: "52px",
          zIndex: 1,
        }}
      >
        NAMMA DHARANI
      </div>

      {/* Orbital spinner */}
      <div
        style={{
          position: "relative",
          width: "76px",
          height: "76px",
          marginBottom: "32px",
          zIndex: 1,
        }}
      >
        {/* Outer orbit */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid rgba(108, 207, 255, 0.15)",
            borderTop: "1.5px solid #6ccfff",
            borderRadius: "50%",
            animation: "spinA 1.4s linear infinite",
          }}
        />
        {/* Mid orbit */}
        <div
          style={{
            position: "absolute",
            inset: "14px",
            border: "1.5px solid rgba(58, 167, 255, 0.15)",
            borderBottom: "1.5px solid #3aa7ff",
            borderRadius: "50%",
            animation: "spinB 1.0s linear infinite reverse",
          }}
        />
        {/* Inner orbit */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            border: "1.5px solid rgba(158, 240, 196, 0.15)",
            borderLeft: "1.5px solid #9ef0c4",
            borderRadius: "50%",
            animation: "spinA 0.7s linear infinite",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            inset: "34px",
            backgroundColor: "#6ccfff",
            borderRadius: "50%",
            boxShadow: "0 0 8px #6ccfff, 0 0 16px #3aa7ff",
          }}
        />
      </div>

      {/* Status text */}
      <div
        style={{
          color: "#6ccfff",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "10px",
          letterSpacing: "4px",
          opacity: 0.55,
          textTransform: "uppercase",
          zIndex: 1,
        }}
      >
        Loading Earth...
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        @keyframes spinA {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinB {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ambientPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
