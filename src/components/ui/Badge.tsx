import type { ReactNode } from 'react';

type BadgeVariant = 'gold' | 'dark' | 'terracotta' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-gold text-charcoal',
  dark: 'bg-charcoal text-cream',
  terracotta: 'bg-terracotta text-white',
  outline: 'border border-terracotta text-terracotta bg-transparent',
};

export function Badge({ variant = 'gold', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
