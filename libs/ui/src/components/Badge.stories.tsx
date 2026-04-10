import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    status: {
      control: 'select',
      options: ['considering', 'shortlisted', 'winner', 'purchased'],
    },
    showLabel: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Considering: Story = {
  args: { status: 'considering', showLabel: true },
};

export const Shortlisted: Story = {
  args: { status: 'shortlisted', showLabel: true },
};

export const Winner: Story = {
  args: { status: 'winner' },
};

export const Purchased: Story = {
  args: { status: 'purchased' },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400 w-20">Icon only</span>
        <Badge status="considering" />
        <Badge status="shortlisted" />
        <Badge status="winner" />
        <Badge status="purchased" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400 w-20">With label</span>
        <Badge status="considering" showLabel />
        <Badge status="shortlisted" showLabel />
        <Badge status="winner" showLabel />
        <Badge status="purchased" showLabel />
      </div>
    </div>
  ),
};
