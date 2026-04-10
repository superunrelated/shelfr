import { RiAddLine } from '@remixicon/react';

interface ProConListProps {
  pros: string[];
  cons: string[];
  onAddPro?: () => void;
  onAddCon?: () => void;
}

export function ProConList({ pros, cons, onAddPro, onAddCon }: ProConListProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-emerald-50/60 rounded p-3">
        <p className="text-[11px] font-semibold text-emerald-600 mb-2">Pros</p>
        {pros.map((pro, i) => (
          <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5">
            <span className="text-emerald-500">+</span>{pro}
          </div>
        ))}
        {onAddPro && (
          <button
            onClick={onAddPro}
            className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-emerald-300 hover:text-emerald-600 mt-1 flex items-center gap-1"
          >
            <RiAddLine size={12} /> add
          </button>
        )}
      </div>
      <div className="bg-red-50/60 rounded p-3">
        <p className="text-[11px] font-semibold text-red-500 mb-2">Cons</p>
        {cons.map((con, i) => (
          <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5">
            <span className="text-red-400">&minus;</span>{con}
          </div>
        ))}
        {onAddCon && (
          <button
            onClick={onAddCon}
            className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-red-300 hover:text-red-500 mt-1 flex items-center gap-1"
          >
            <RiAddLine size={12} /> add
          </button>
        )}
      </div>
    </div>
  );
}
