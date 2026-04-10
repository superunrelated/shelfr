import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ImagePasteable } from './ImagePasteable';
const fn = () => () => {};

const meta: Meta<typeof ImagePasteable> = { title: 'Components/ImagePasteable', component: ImagePasteable };
export default meta;
type Story = StoryObj<typeof ImagePasteable>;

export const Empty: Story = {
  args: { src: null, onImageChange: fn(), onClose: fn() },
};

export const WithImage: Story = {
  args: {
    src: 'https://picsum.photos/seed/product1/400/300',
    alt: 'Sample product',
    onImageChange: fn(),
    onClose: fn(),
  },
};

export const Interactive: Story = {
  render: () => {
    const [src, setSrc] = useState<string | null>(null);
    return (
      <div className="w-80">
        <ImagePasteable src={src} onImageChange={setSrc} onClose={() => setSrc(null)} />
        <p className="text-xs text-neutral-400 mt-2">Paste an image URL or copy-paste an image from your clipboard</p>
      </div>
    );
  },
};

export const Square: Story = {
  args: {
    src: 'https://picsum.photos/seed/product2/400/400',
    aspect: 'square',
    onClose: fn(),
  },
};
