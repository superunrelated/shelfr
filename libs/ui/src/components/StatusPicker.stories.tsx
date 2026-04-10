import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { StatusPicker } from './StatusPicker';
import type { ProductStatus } from '@shelfr/shared';

const meta: Meta<typeof StatusPicker> = {
  title: 'Components/StatusPicker',
  component: StatusPicker,
  argTypes: {
    value: {
      control: 'select',
      options: ['considering', 'shortlisted', 'winner', 'purchased'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusPicker>;

export const Considering: Story = {
  args: { value: 'considering' },
};

export const Shortlisted: Story = {
  args: { value: 'shortlisted' },
};

export const Winner: Story = {
  args: { value: 'winner' },
};

export const Purchased: Story = {
  args: { value: 'purchased' },
};

export const Interactive: Story = {
  render: () => {
    const [status, setStatus] = useState<ProductStatus>('considering');
    return (
      <div className="flex flex-col gap-3">
        <StatusPicker value={status} onChange={setStatus} />
        <p className="text-xs text-neutral-400">
          Current: <span className="font-medium text-[#1c1e2a]">{status}</span>
        </p>
      </div>
    );
  },
};
