import type { ReactNode } from 'react';

export function Slide({ children }: { children: ReactNode }) {
  return (
    <div className="grid-bg flex h-full w-full flex-col justify-center px-10 py-16 sm:px-20 lg:px-28">
      <div className="animate-fade-in mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
      {children}
    </p>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-glow mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
      {children}
    </h1>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 max-w-2xl text-lg text-slate-300 sm:text-xl">
      {children}
    </p>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-lg text-slate-200">
          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-black/60 p-5 text-sm text-cyan-200 shadow-[0_0_30px_-10px_rgba(34,211,238,0.4)]">
      <code>{children}</code>
    </pre>
  );
}

export function Callout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
        {label}
      </p>
      <div className="text-slate-200">{children}</div>
    </div>
  );
}

export function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100">
            {step}
          </div>
          {i < steps.length - 1 && (
            <span className="text-xl text-cyan-500/60">&rarr;</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function TechGrid({
  items,
}: {
  items: { name: string; blurb: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.name}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
        >
          <p className="mb-1 font-semibold text-cyan-300">{item.name}</p>
          <p className="text-sm text-slate-400">{item.blurb}</p>
        </div>
      ))}
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-lg text-slate-200">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-cyan-400/50 text-cyan-300">
            &#10003;
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TwoColumn({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
