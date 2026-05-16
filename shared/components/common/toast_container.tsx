'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/shared/store';
import type { Toast } from '@/shared/types';

const ICONS: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS: Record<Toast['type'], string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  error:   'border-red-500/40 bg-red-500/10 text-red-300',
  info:    'border-blue-500/40 bg-blue-500/10 text-blue-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

const ICON_COLORS: Record<Toast['type'], string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-blue-400',
  warning: 'text-amber-400',
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl shadow-xl transition-all duration-300 ${COLORS[toast.type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <span className={`mt-0.5 text-sm font-bold ${ICON_COLORS[toast.type]}`}>
        {ICONS[toast.type]}
      </span>
      <p className="flex-1 text-sm leading-snug text-white/90">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-1 text-white/40 hover:text-white/80 transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useStore((s) => s.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-1.5rem)]"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
