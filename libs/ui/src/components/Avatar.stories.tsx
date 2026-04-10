import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { backgrounds: { default: 'dark' } },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = { args: { email: 'knut@example.com' } };
export const NoEmail: Story = { args: {} };
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar email="a@b.com" size="sm" />
      <Avatar email="a@b.com" size="md" />
    </div>
  ),
};
