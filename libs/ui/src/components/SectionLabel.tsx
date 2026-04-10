interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">
      {children}
    </p>
  );
}
