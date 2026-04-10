import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-150 disabled:opacity-40 cursor-pointer disabled:cursor-default';

const variants: Record<Variant, string> = {
  primary: 'px-4 py-2 rounded bg-[#1c1e2a] text-white hover:bg-[#2a2d3d]',
  secondary:
    'px-4 py-2 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
  ghost: 'px-2 py-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';
