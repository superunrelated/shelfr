import { useCallback, useEffect, useState, type ReactNode } from 'react';

function readIndexFromHash(total: number): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n - 1, 0), total - 1);
}

export function Deck({ slides }: { slides: ReactNode[] }) {
  const total = slides.length;
  const [index, setIndex] = useState(() => readIndexFromHash(total));

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.min(Math.max(next, 0), total - 1));
    },
    [total]
  );

  useEffect(() => {
    window.history.replaceState(null, '', `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    function onHashChange() {
      setIndex(readIndexFromHash(total));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [total]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === 'Home') {
        goTo(0);
      } else if (e.key === 'End') {
        goTo(total - 1);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, goTo, total]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const isRightHalf = e.clientX > window.innerWidth / 2;
    goTo(isRightHalf ? index + 1 : index - 1);
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[#05070a]"
      onClick={handleClick}
    >
      <div key={index} className="h-full w-full">
        {slides[index]}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-8 pb-6">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-slate-500">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(total).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}
