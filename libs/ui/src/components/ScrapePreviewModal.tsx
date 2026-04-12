interface ScrapeData {
  title?: string;
  image_url?: string;
  price?: number;
  shop_name?: string;
}

interface ScrapePreviewModalProps {
  preview: ScrapeData;
  currentTitle: string;
  currentPrice: number;
  currentImageUrl: string | null;
  currentShopName: string;
  onApply: () => void;
  onDismiss: () => void;
}

export function ScrapePreviewModal({
  preview,
  currentTitle,
  currentPrice,
  currentImageUrl,
  currentShopName,
  onApply,
  onDismiss,
}: ScrapePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Refresh preview"
    >
      <div
        className="bg-white rounded shadow-xl w-96 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {preview.image_url && (
          <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden relative">
            <img
              src={preview.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
            {preview.image_url !== currentImageUrl && (
              <span className="absolute top-3 left-3 text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-medium">
                New image
              </span>
            )}
          </div>
        )}
        <div className="p-5 flex flex-col gap-3">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
            {preview.shop_name || currentShopName}
          </p>
          <div>
            <p className="text-base font-semibold text-[#1c1e2a] font-serif leading-snug">
              {preview.title || currentTitle}
            </p>
            {preview.title && preview.title !== currentTitle && (
              <p className="text-[11px] text-neutral-400 mt-0.5 line-through">
                {currentTitle}
              </p>
            )}
          </div>
          {preview.price !== null && preview.price !== undefined && (
            <div className="bg-neutral-50 rounded p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1c1e2a]">
                  ${preview.price.toLocaleString()}
                </span>
                {preview.price !== currentPrice && (
                  <span
                    className={`text-xs font-semibold ${preview.price < currentPrice ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {preview.price < currentPrice
                      ? `↓$${(currentPrice - preview.price).toLocaleString()}`
                      : `↑$${(preview.price - currentPrice).toLocaleString()}`}
                  </span>
                )}
              </div>
              {preview.price !== currentPrice && (
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Was ${currentPrice.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onApply}
            className="flex-1 text-xs font-medium text-white bg-[#1c1e2a] px-4 py-2.5 rounded hover:bg-[#2a2d3d] transition-colors"
          >
            Update product
          </button>
          <button
            onClick={onDismiss}
            className="text-xs text-neutral-400 hover:text-neutral-600 px-4 py-2.5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
