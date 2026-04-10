import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    variant: { control: 'select', options: ['light', 'dark'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Dark: Story = { args: { variant: 'dark', size: 'md' } };
export const Light: Story = {
  args: { variant: 'light', size: 'md' },
  parameters: { backgrounds: { default: 'dark' } },
};
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Logo size="sm" /> <Logo size="md" /> <Logo size="lg" />
    </div>
  ),
};
