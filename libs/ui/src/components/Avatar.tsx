interface AvatarProps {
  email?: string;
  size?: 'sm' | 'md';
}

const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-7 h-7 text-[11px]' };

export function Avatar({ email, size = 'md' }: AvatarProps) {
  const initial = email?.[0]?.toUpperCase() ?? '?';
  return (
    <div className={`${sizes[size]} rounded-full bg-neutral-600 flex items-center justify-center text-neutral-300 font-medium flex-shrink-0`}>
      {initial}
    </div>
  );
}
