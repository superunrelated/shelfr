import { useEffect, useState } from 'react';
import { RiAddLine, RiLink, RiCloseLine, RiChromeLine } from '@remixicon/react';
import { Button } from '@shelfr/ui';

const EXTENSION_ID = 'aacpljgijhpobmfdjbhdipjjjakndaod';
const EXTENSION_STORE_URL = `https://chromewebstore.google.com/detail/shelfr/${EXTENSION_ID}`;

function useExtensionStatus() {
  const isChrome =
    typeof navigator !== 'undefined' &&
    /Chrome\/\d+/.test(navigator.userAgent) &&
    !/Edg\//.test(navigator.userAgent);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    if (!isChrome) return;
    const img = new Image();
    img.onload = () => setInstalled(true);
    img.onerror = () => setInstalled(false);
    img.src = `chrome-extension://${EXTENSION_ID}/icons/icon-16.png`;
  }, [isChrome]);
  return { isChrome, installed };
}

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
  const { isChrome, installed } = useExtensionStatus();
  return (
    <div className="bg-[#1c1e2a] border-t border-[#262838] px-4 md:px-6 py-3 md:py-3.5 flex flex-col gap-2 flex-shrink-0 sticky bottom-0 z-20 pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]">
      {warning && !manualEntry && (
        <div
          className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/50 px-3 py-2 rounded"
          role="alert"
        >
          <span className="flex-1">{warning}</span>
          <button onClick={onDismissWarning} aria-label="Dismiss warning">
            <RiCloseLine size={14} />
          </button>
        </div>
      )}

      {manualEntry && (
        <ExtensionCta
          url={manualEntry.url}
          isChrome={isChrome}
          installed={installed}
        />
      )}

      {/* Manual entry fallback */}
      {manualEntry ? (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
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
              className="flex-[2] text-xs px-3.5 py-2.5 border border-[#2a2d3d] rounded bg-[#232536] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#3d4055] transition-colors"
            />
            <input
              value={manualEntry.price}
              onChange={(e) =>
                onManualChange({ ...manualEntry, price: e.target.value })
              }
              placeholder="Price"
              type="number"
              className="w-24 text-xs px-3.5 py-2.5 border border-[#2a2d3d] rounded bg-[#232536] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#3d4055] transition-colors"
            />
            <input
              value={manualEntry.imageUrl}
              onChange={(e) =>
                onManualChange({ ...manualEntry, imageUrl: e.target.value })
              }
              placeholder="Image URL (optional)"
              className="flex-[2] text-xs px-3.5 py-2.5 border border-[#2a2d3d] rounded bg-[#232536] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#3d4055] transition-colors"
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
          <div className="flex-1 flex items-center gap-2.5 border border-[#2a2d3d] rounded bg-[#232536] px-4 focus-within:border-[#3d4055] focus-within:bg-[#232536] transition-all">
            <RiLink size={15} className="text-neutral-500 flex-shrink-0" />
            <label className="sr-only" htmlFor="urlinput">
              Product URL
            </label>
            <input
              id="urlinput"
              value={urlInput}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              placeholder="Paste a product URL to add..."
              className="flex-1 text-xs py-2.5 bg-transparent focus:outline-none text-neutral-200 placeholder:text-neutral-500"
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

function ExtensionCta({
  url,
  isChrome,
  installed,
}: {
  url: string;
  isChrome: boolean;
  installed: boolean;
}) {
  let body: React.ReactNode;
  if (isChrome && !installed) {
    body = (
      <>
        <span className="flex-1">
          This site blocks our scraper. The Shelfr extension can save it
          directly from the page.
        </span>
        <a
          href={EXTENSION_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline whitespace-nowrap"
        >
          <RiChromeLine size={14} /> Install extension
        </a>
      </>
    );
  } else if (isChrome && installed) {
    body = (
      <span className="flex-1">
        This site blocks our scraper.{' '}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-emerald-200"
        >
          Open the page
        </a>{' '}
        and click the Shelfr extension icon to save it directly.
      </span>
    );
  } else {
    body = (
      <span className="flex-1">
        This site blocks our scraper. Fill in the details below, or use Chrome
        with the Shelfr extension to save it directly from the page.
      </span>
    );
  }
  return (
    <div className="flex items-start gap-2 text-[11px] text-emerald-200 bg-emerald-950/40 border border-emerald-900/60 px-3 py-2 rounded">
      {body}
    </div>
  );
}
