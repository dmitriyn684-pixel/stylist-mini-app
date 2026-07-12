import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-cream hover:opacity-90',
  secondary: 'bg-white text-ink border border-ink/10 hover:border-ink/20',
  ghost: 'bg-transparent text-ink-soft hover:text-ink',
};

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
