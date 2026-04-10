interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  return (
    <span className={`${sizes[size]} tracking-tight font-serif ${variant === 'light' ? 'text-white' : 'text-[#1c1e2a]'}`}>
      shelf<span className="text-amber-400">r</span>
    </span>
  );
}
