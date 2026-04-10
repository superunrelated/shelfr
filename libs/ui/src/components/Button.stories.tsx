import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { RiAddLine, RiDeleteBinLine, RiScalesLine } from '@remixicon/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Add product', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Compare', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Cancel', variant: 'ghost' },
};

export const Disabled: Story = {
  args: { children: 'Disabled', variant: 'primary', disabled: true },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="primary">
        <RiAddLine size={14} /> Add product
      </Button>
      <Button variant="secondary">
        <RiScalesLine size={14} /> Compare
      </Button>
      <Button variant="ghost">
        <RiDeleteBinLine size={14} /> Delete
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" disabled>Primary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="ghost" disabled>Ghost</Button>
      </div>
    </div>
  ),
};
