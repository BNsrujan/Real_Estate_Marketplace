'use client';

import { useCallback } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  step?: number;
  formatLabel?: (v: number) => string;
}

function defaultFormat(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(0)} L`;
  return `₹${v.toLocaleString()}`;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 100000,
  formatLabel = defaultFormat,
}: PriceRangeSliderProps) {
  const [minVal, maxVal] = value;

  const handleMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), maxVal - step);
      onChange([v, maxVal]);
    },
    [maxVal, onChange, step],
  );

  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), minVal + step);
      onChange([minVal, v]);
    },
    [minVal, onChange, step],
  );

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
    
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {formatLabel(minVal)}
        </span>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {formatLabel(maxVal)}
        </span>
      </div>

  
      <div className="relative h-6 flex items-center">
       
        <div className="absolute h-1 w-full rounded-full bg-muted" />

   
        <div
          className="absolute h-1 rounded-full bg-primary transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{
            left: `${pct(minVal)}%`,
            width: `${pct(maxVal) - pct(minVal)}%`,
          }}
        />

  
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMin}
          className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: minVal > max - step ? 5 : 3 }}
        />

    
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMax}
          className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: 4 }}
        />

      
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md ring-2 ring-primary/30 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ left: `${pct(minVal)}%` }}
        />

        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md ring-2 ring-primary/30 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ left: `${pct(maxVal)}%` }}
        />
      </div>
    </div>
  );
}
