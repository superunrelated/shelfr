import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Components/StarRating',
  component: StarRating,
  argTypes: {
    rating: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    size: { control: { type: 'range', min: 10, max: 32, step: 2 } },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: { rating: 3, size: 18 },
};

export const Empty: Story = {
  args: { rating: 0, size: 18 },
};

export const Full: Story = {
  args: { rating: 5, size: 18 },
};

export const ReadOnly: Story = {
  args: { rating: 4, size: 14, interactive: false },
};

export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <StarRating rating={rating} size={20} onRate={setRating} />
        <p className="text-xs text-neutral-400">
          {rating === 0 ? 'Click a star to rate' : `Rated ${rating}/5 — click same star to unrate`}
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[10, 12, 14, 18, 24].map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 w-10">{size}px</span>
          <StarRating rating={4} size={size} interactive={false} />
        </div>
      ))}
    </div>
  ),
};
