import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(name?: string | null): string {
  if (!name) return '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function isLocalPreview(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:');
}

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, name, size = 32, className }: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-hairline-strong bg-parchment-deep text-ink',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ''}
          width={size}
          height={size}
          unoptimized={isLocalPreview(src)}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <span
          className="font-mono font-medium tracking-[0.06em]"
          style={{ fontSize: Math.max(9, Math.round(size * 0.34)) }}
        >
          {initials}
        </span>
      ) : (
        <User size={Math.round(size * 0.45)} className="text-ink-muted" />
      )}
    </span>
  );
}
