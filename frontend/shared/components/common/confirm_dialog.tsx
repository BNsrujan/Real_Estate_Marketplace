'use client';

import { ReactNode, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  trigger: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
  confirmLabel = 'Confirm',
  destructive = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="relative max-w-sm overflow-hidden rounded-3xl border-border bg-background p-6 shadow-xl">
          {/* Atmospheric blur shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-secondary/60 blur-3xl"
          />

          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  destructive
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {destructive ? (
                  <AlertTriangle size={16} />
                ) : (
                  <Info size={16} />
                )}
              </span>
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="relative mt-6 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="rounded-full border-border"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              className="rounded-full"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Loading…' : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
