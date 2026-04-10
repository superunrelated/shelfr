import { RiImageLine, RiCloseLine } from '@remixicon/react';

interface ImagePasteableProps {
  src: string | null;
  alt?: string;
  onImageChange?: (url: string) => void;
  onClose?: () => void;
  aspect?: 'video' | 'square';
}

const aspects = {
  video: 'aspect-[4/3]',
  square: 'aspect-square',
};

export function ImagePasteable({ src, alt = '', onImageChange, onClose, aspect = 'video' }: ImagePasteableProps) {
  function handlePaste(e: React.ClipboardEvent) {
    if (!onImageChange) return;
    const text = e.clipboardData.getData('text/plain').trim();
    if (text && (text.startsWith('http://') || text.startsWith('https://')) && /\.(jpg|jpeg|png|gif|webp|avif|svg)/i.test(text)) {
      onImageChange(text);
      e.preventDefault();
      return;
    }
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') onImageChange(reader.result);
          };
          reader.readAsDataURL(file);
        }
        e.preventDefault();
        break;
      }
    }
  }

  return (
    <div
      className={`relative w-full ${aspects[aspect]} bg-neutral-100 flex-shrink-0 overflow-hidden group`}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
          <RiImageLine size={40} className="text-neutral-300" />
          <p className="text-[11px] text-neutral-400">Click here and paste an image</p>
        </div>
      )}
      {src && onImageChange && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-[11px] text-white font-medium">Paste to replace image</p>
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded bg-white/90 text-neutral-400 flex items-center justify-center hover:text-neutral-600 shadow-sm z-10">
          <RiCloseLine size={18} />
        </button>
      )}
    </div>
  );
}
