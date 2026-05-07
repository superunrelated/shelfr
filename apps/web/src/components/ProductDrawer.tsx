import { useCallback } from 'react';
import {
  RiCloseLine,
  RiExternalLinkLine,
  RiRefreshLine,
  RiArchiveLine,
  RiDeleteBinLine,
  RiImageLine,
  RiArrowGoForwardLine,
} from '@remixicon/react';
import { StarRating, StatusPicker, SectionLabel } from '@shelfr/ui';
import { uploadImage } from '@shelfr/shared';
import type { Product, ProductStatus } from '@shelfr/shared';
import { useDebouncedUpdate } from '../hooks/useDebouncedUpdate';

interface ProductDrawerProps {
  product: Product;
  readOnly?: boolean;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onArchive: () => void;
  onDelete: () => void;
  onMove?: () => void;
  onClose: () => void;
  onRescrape: () => void;
  rescraping: boolean;
}

export function ProductDrawer({
  product,
  readOnly = false,
  onUpdate,
  onArchive,
  onDelete,
  onMove,
  onClose,
  onRescrape,
  rescraping,
}: ProductDrawerProps) {
  const saveTitle = useCallback(
    (v: string) => onUpdate(product.id, { title: v }),
    [product.id, onUpdate]
  );
  const saveNotes = useCallback(
    (v: string) => onUpdate(product.id, { notes: v }),
    [product.id, onUpdate]
  );
  const savePrice = useCallback(
    (v: string) => onUpdate(product.id, { price: parseFloat(v) || 0 }),
    [product.id, onUpdate]
  );

  const [dTitle, setDTitle] = useDebouncedUpdate(product.title, saveTitle);
  const [dNotes, setDNotes] = useDebouncedUpdate(product.notes, saveNotes);
  const [dPrice, setDPrice] = useDebouncedUpdate(
    String(product.price),
    savePrice
  );

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text/plain').trim();
    if (
      text &&
      text.startsWith('http') &&
      /\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(text)
    ) {
      onUpdate(product.id, { image_url: text });
      e.preventDefault();
      return;
    }
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadImage(file).then((url) => {
            if (url) onUpdate(product.id, { image_url: url });
          });
        }
        break;
      }
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-0 z-40 bg-white flex flex-col overflow-hidden md:static md:inset-auto md:z-auto md:w-96 md:flex-shrink-0 md:border-l md:border-neutral-200/80">
        {/* Image */}
        <div
          className="relative w-full aspect-[4/3] bg-neutral-100 flex-shrink-0 overflow-hidden group"
          onPaste={handlePaste}
          tabIndex={0}
          role="button"
          aria-label="Product image — click and paste to change"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
              <RiImageLine size={40} className="text-neutral-300" />
              <p className="text-[11px] text-neutral-400">
                Click here and paste an image
              </p>
            </div>
          )}
          {product.image_url && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-[11px] text-white font-medium">
                Paste to replace image
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 md:w-8 md:h-8 rounded-full md:rounded bg-white/90 text-neutral-500 flex items-center justify-center hover:text-neutral-600 shadow-sm z-10"
            aria-label="Close drawer"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {/* Shop + Title */}
          <div>
            {product.source_url ? (
              <a
                href={product.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-neutral-400 hover:text-[#1c1e2a] mb-1 font-medium uppercase tracking-wider flex items-center gap-1 group transition-colors"
              >
                {product.shop_name}
                <RiExternalLinkLine
                  size={10}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ) : (
              <p className="text-[10px] text-neutral-400 mb-1 font-medium uppercase tracking-wider">
                {product.shop_name}
              </p>
            )}
            <label className="sr-only" htmlFor="drawer-title">
              Product name
            </label>
            <input
              id="drawer-title"
              value={dTitle}
              onChange={(e) => setDTitle(e.target.value)}
              readOnly={readOnly}
              className={`text-base font-semibold text-[#1c1e2a] leading-snug font-serif w-full bg-transparent border-b border-transparent focus:outline-none transition-colors pb-0.5 ${readOnly ? '' : 'hover:border-neutral-200 focus:border-neutral-400'}`}
              placeholder="Product name"
            />
          </div>

          {/* Price + Quantity + Total */}
          <div className="bg-neutral-50 rounded p-3.5 flex items-center">
            <div className="flex-1">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">
                Price
              </p>
              <div className="flex items-center gap-0.5">
                <span className="text-lg font-bold text-[#1c1e2a]">$</span>
                <label className="sr-only" htmlFor="drawer-price">
                  Price
                </label>
                <input
                  id="drawer-price"
                  type="number"
                  value={dPrice}
                  onChange={(e) => setDPrice(e.target.value)}
                  className="text-lg font-bold text-[#1c1e2a] bg-transparent w-20 border-b border-transparent hover:border-neutral-300 focus:border-neutral-400 focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>
              {product.price < product.original_price && (
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Was ${Number(product.original_price).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex-1 flex justify-center">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1 text-center">
                  Quantity
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdate(product.id, {
                        quantity: Math.max(1, (product.quantity || 1) - 1),
                      })
                    }
                    className="w-6 h-6 rounded border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-[#1c1e2a] w-5 text-center">
                    {product.quantity || 1}
                  </span>
                  <button
                    onClick={() =>
                      onUpdate(product.id, {
                        quantity: (product.quantity || 1) + 1,
                      })
                    }
                    className="w-6 h-6 rounded border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1">
                Total
              </p>
              <span className="text-lg font-bold text-[#1c1e2a]">
                $
                {(
                  Number(product.price) * (product.quantity || 1)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <SectionLabel>Rating</SectionLabel>
            <StarRating
              rating={product.rating}
              size={16}
              onRate={
                readOnly
                  ? undefined
                  : (r) => onUpdate(product.id, { rating: r })
              }
            />
          </div>

          {/* Status */}
          {!readOnly && (
            <div>
              <SectionLabel>Status</SectionLabel>
              <StatusPicker
                value={product.status as ProductStatus}
                onChange={(s) => onUpdate(product.id, { status: s })}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5 font-medium block"
              htmlFor="drawer-notes"
            >
              Notes
            </label>
            <textarea
              id="drawer-notes"
              value={dNotes}
              onChange={(e) => setDNotes(e.target.value)}
              readOnly={readOnly}
              placeholder={
                readOnly ? 'No notes' : 'What do you think about this one?...'
              }
              className="w-full text-xs border border-neutral-200 rounded p-2.5 bg-white resize-none focus:outline-none focus:border-neutral-400 leading-relaxed min-h-16"
              rows={2}
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-center gap-3 md:gap-1 px-4 py-1.5 border-t border-neutral-200/80 flex-shrink-0 pb-[max(env(safe-area-inset-bottom,0px),0.375rem)]">
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in shop"
              className="p-3 md:p-2 rounded text-neutral-400 hover:text-[#1c1e2a] hover:bg-neutral-100 transition-colors"
            >
              <RiExternalLinkLine size={18} />
            </a>
          )}
          {product.source_url && (
            <button
              onClick={onRescrape}
              disabled={rescraping}
              title="Refresh from website"
              className="p-3 md:p-2 rounded text-neutral-400 hover:text-[#1c1e2a] hover:bg-neutral-100 transition-colors disabled:opacity-50"
            >
              <RiRefreshLine
                size={18}
                className={rescraping ? 'animate-spin' : ''}
              />
            </button>
          )}
          {!readOnly && (
            <>
              <div className="w-px h-5 bg-neutral-200" />
              {onMove && (
                <button
                  onClick={onMove}
                  title="Move to another shelf"
                  className="p-3 md:p-2 rounded text-neutral-400 hover:text-[#1c1e2a] hover:bg-neutral-100 transition-colors"
                >
                  <RiArrowGoForwardLine size={18} />
                </button>
              )}
              <button
                onClick={onArchive}
                title={product.archived ? 'Unarchive' : 'Archive'}
                className="p-3 md:p-2 rounded text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <RiArchiveLine size={18} />
              </button>
              <button
                onClick={onDelete}
                title="Delete permanently"
                className="p-3 md:p-2 rounded text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <RiDeleteBinLine size={18} />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
