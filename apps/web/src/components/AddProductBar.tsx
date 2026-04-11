import { RiAddLine, RiLink, RiCloseLine } from '@remixicon/react';
import { Button } from '@shelfr/ui';

interface ManualEntry {
  url: string;
  title: string;
  price: string;
  imageUrl: string;
}

interface AddProductBarProps {
  urlInput: string;
  onUrlChange: (url: string) => void;
  onAdd: () => void;
  adding: boolean;
  warning: string;
  onDismissWarning: () => void;
  manualEntry: ManualEntry | null;
  onManualChange: (entry: ManualEntry) => void;
  onManualSubmit: () => void;
  onManualCancel: () => void;
}

export function AddProductBar({
  urlInput,
  onUrlChange,
  onAdd,
  adding,
  warning,
  onDismissWarning,
  manualEntry,
  onManualChange,
  onManualSubmit,
  onManualCancel,
}: AddProductBarProps) {
  return (
    <div className="bg-white border-t border-neutral-200/80 px-4 md:px-6 py-3 md:py-3.5 flex flex-col gap-2 flex-shrink-0 sticky bottom-0 z-20 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]">
      {warning && (
        <div
          className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded"
          role="alert"
        >
          <span className="flex-1">{warning}</span>
          <button onClick={onDismissWarning} aria-label="Dismiss warning">
            <RiCloseLine size={14} />
          </button>
        </div>
      )}

      {/* Manual entry fallback */}
      {manualEntry ? (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
            Add product details manually
          </p>
          <div className="flex gap-2">
            <input
              value={manualEntry.title}
              onChange={(e) =>
                onManualChange({ ...manualEntry, title: e.target.value })
              }
              placeholder="Product title"
              autoFocus
              className="flex-[2] text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
            />
            <input
              value={manualEntry.price}
              onChange={(e) =>
                onManualChange({ ...manualEntry, price: e.target.value })
              }
              placeholder="Price"
              type="number"
              className="w-24 text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
            />
            <input
              value={manualEntry.imageUrl}
              onChange={(e) =>
                onManualChange({ ...manualEntry, imageUrl: e.target.value })
              }
              placeholder="Image URL (optional)"
              className="flex-[2] text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onManualSubmit}
              disabled={!manualEntry.title.trim()}
            >
              <RiAddLine size={14} /> Add
            </Button>
            <Button variant="secondary" onClick={onManualCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <div className="flex-1 flex items-center gap-2.5 border border-neutral-200 rounded bg-neutral-50 px-4 focus-within:border-neutral-400 focus-within:bg-white transition-all">
            <RiLink size={15} className="text-neutral-300 flex-shrink-0" />
            <label className="sr-only" htmlFor="urlinput">
              Product URL
            </label>
            <input
              id="urlinput"
              value={urlInput}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              placeholder="Paste a product URL to add..."
              className="flex-1 text-xs py-2.5 bg-transparent focus:outline-none text-neutral-700 placeholder:text-neutral-400"
            />
          </div>
          <Button onClick={onAdd} disabled={adding}>
            {adding ? (
              'Fetching...'
            ) : (
              <>
                <RiAddLine size={14} /> Add
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
