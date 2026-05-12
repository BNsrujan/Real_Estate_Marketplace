"use client";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoaded: boolean;
  appName?: string;
  backgroundImage?: string;
}

const MIN_DISPLAY_MS = 2200;

export default function LoadingScreen({
  isLoaded,
  appName = "Namma Dharani",
  backgroundImage = "/pics/Loading.png",
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [progress, setProgress] = useState(0);

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

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-[9999] flex items-center justify-center",
          "transition-opacity duration-1000 ease-in-out",
          fading ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.45] saturate-[0.7] animate-bg-drift"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />


        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.40) 100%)",
          }}
        /> 


        {/* ── Center content ── */}
        <div
          role="status"
          aria-label={`Loading ${appName}`}
          className="relative z-10 flex flex-col items-center text-center animate-rise"
        >

          {/* <div
            aria-hidden="true"
            className="relative w-16 h-16 rounded-full border border-white/25 bg-white/[0.04] backdrop-blur-sm flex items-center justify-center mb-7"
          >
        
            <span
              className="absolute -inset-[3px] rounded-full border-[1.5px] border-transparent animate-arc-spin"
              style={{
                borderTopColor: "rgba(255,255,255,0.70)",
                borderRightColor: "rgba(255,255,255,0.18)",
              }}
            />
            <span className="font-cormorant font-light text-[22px] text-white/85 tracking-[0.05em] leading-none select-none">
              {appName.charAt(0).toUpperCase()}
            </span>
          </div> */}

          {/* App name */}
          <h1 className="font-cormorant font-light  tracking-[0.12em] leading-none text-white/90 mb-2.5 animate-rise-d1 text-5xl sm:text-6xl lg:text-7xl">
            {appName}
          </h1>

          {/* Tagline */}
          <p className="font-tenor text-[0.65rem] uppercase tracking-[0.42em] text-white/38 mb-12 animate-rise-d2">
            your property, our priority 
          </p>

          {/* Progress bar + percentage + dots */}
          <div className="flex flex-col items-center gap-3 w-[200px] sm:w-[260px] animate-rise-d3">
            {/* Track */}
            <div className="relative w-full h-px bg-white/[0.12] overflow-hidden">
              {/* Fill bar */}
              <div
                className="absolute inset-0 bg-white/70 origin-left transition-transform duration-[350ms] ease-in-out"
                style={{ transform: `scaleX(${clampedProgress / 100})` }}
              />
            </div>  
          </div>
        </div>
      </div>
    </>
  );
}