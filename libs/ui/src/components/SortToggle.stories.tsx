import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SortToggle, type SortKey } from './SortToggle';

const meta: Meta<typeof SortToggle> = { title: 'Components/SortToggle', component: SortToggle };
export default meta;
type Story = StoryObj<typeof SortToggle>;

export const Default: Story = { args: { value: 'rating' } };

export const Interactive: Story = {
  render: () => {
    const [sort, setSort] = useState<SortKey>('rating');
    return (
      <div className="flex items-center gap-3">
        <SortToggle value={sort} onChange={setSort} />
        <span className="text-xs text-neutral-400">Sorting by: {sort}</span>
      </div>
    );
  },
};
