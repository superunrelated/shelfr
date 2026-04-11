import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ghost-muted';
type Size = 'sm' | 'md';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 disabled:opacity-40 cursor-pointer disabled:cursor-default';

const sizes: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
};

const variants: Record<Variant, string> = {
  primary: 'px-4 py-2 rounded bg-[#1c1e2a] text-white hover:bg-[#2a2d3d]',
  secondary:
    'px-4 py-2 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
  ghost:
    'px-2 py-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
  'ghost-muted': 'px-2 py-1 rounded text-neutral-500 hover:text-neutral-300',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth = false, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';
