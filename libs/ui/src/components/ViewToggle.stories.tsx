import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ViewToggle, type ViewMode } from './ViewToggle';

const meta: Meta<typeof ViewToggle> = { title: 'Components/ViewToggle', component: ViewToggle };
export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const Default: Story = { args: { value: 'medium' } };

export const Interactive: Story = {
  render: () => {
    const [mode, setMode] = useState<ViewMode>('medium');
    return (
      <div className="flex items-center gap-3">
        <ViewToggle value={mode} onChange={setMode} />
        <span className="text-xs text-neutral-400">Current: {mode}</span>
      </div>
    );
  },
};
