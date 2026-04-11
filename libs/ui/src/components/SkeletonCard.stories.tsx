import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkeletonCard } from './SkeletonCard';

const meta: Meta<typeof SkeletonCard> = {
  title: 'Components/SkeletonCard',
  component: SkeletonCard,
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SkeletonCard>;

export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
