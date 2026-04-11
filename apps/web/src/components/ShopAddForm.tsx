import { useState } from 'react';
import { Button } from '@shelfr/ui';

interface ShopAddFormProps {
  onAdd: (name: string, url: string) => void;
}

export function ShopAddForm({ onAdd }: ShopAddFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  return (
    <div className="flex gap-2.5 mt-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Shop name"
        className="flex-1 text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL (optional)"
        className="flex-[1.5] text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
      />
      <Button
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim(), url);
            setName('');
            setUrl('');
          }
        }}
      >
        Add
      </Button>
    </div>
  );
}
