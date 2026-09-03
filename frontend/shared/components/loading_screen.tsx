"use client";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
  appName?: string;
  backgroundImage?: string;
}

const MIN_DISPLAY_MS = 2200;
const FADE_MS = 1000;
const TICK_MS = 120;
const CREEP_CEILING = 85;

export default function LoadingScreen({
  isLoaded,
  appName = "Namma Dharani",
  backgroundImage = "/pics/Loading.png",
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [creep, setCreep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCreep((p) => (p >= CREEP_CEILING ? p : p + Math.random() * 6));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const remaining = Math.max(0, MIN_DISPLAY_MS - (Date.now() - startTime));
    const fadeTimer = setTimeout(() => setFading(true), remaining);
    const hideTimer = setTimeout(() => setVisible(false), remaining + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoaded, startTime]);

  if (!visible) return null;

  const progress = isLoaded ? 100 : Math.min(CREEP_CEILING, Math.max(0, creep));

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "transition-opacity duration-1000 ease-in-out",
        fading ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.4] saturate-[0.6] animate-bg-drift"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14,13,11,0.20) 0%, rgba(14,13,11,0.72) 100%)",
        }}
      />

      <div
        role="status"
        aria-label={`Loading ${appName}`}
        className="relative z-10 flex flex-col items-center text-center animate-rise"
      >
        <h1 className="font-display font-light tracking-[0.06em] leading-none text-parchment mb-3 animate-rise-d1 text-5xl sm:text-6xl lg:text-7xl">
          {appName}
        </h1>

        <p className="font-mono text-[0.6rem] uppercase tracking-[0.42em] text-parchment/45 mb-12 animate-rise-d2">
          your property, our priority
        </p>

        <div className="flex flex-col items-center gap-3 w-[200px] sm:w-[260px] animate-rise-d3">
          <div className="relative w-full h-px bg-parchment/15 overflow-hidden">
            <div
              className="absolute inset-0 bg-vermilion origin-left transition-transform duration-[350ms] ease-out"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
