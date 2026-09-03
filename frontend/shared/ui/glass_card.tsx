import { cn } from '@/lib/utils';

interface SheetCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, onClick }: SheetCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border border-hairline-strong bg-parchment/95 backdrop-blur-md',
        'shadow-[0_18px_50px_-20px_rgba(14,13,11,0.55)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default GlassCard;
