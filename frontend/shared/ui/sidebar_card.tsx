import { cn } from '@/lib/utils';

interface SidebarCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarCard({ children, className }: SidebarCardProps) {
  return (
    <div className={cn('border border-hairline bg-parchment p-4', className)}>
      {children}
    </div>
  );
}

export default SidebarCard;
