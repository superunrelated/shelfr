import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import {
  RiBookmarkLine,
  RiShoppingBag3Line,
  RiStore2Line,
} from '@remixicon/react';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Welcome: Story = {
  args: {
    icon: RiBookmarkLine,
    title: 'Welcome to Shelfr',
    description: 'Create a collection to start tracking products.',
    action: <Button>New collection</Button>,
  },
};

export const NoProducts: Story = {
  args: {
    icon: RiShoppingBag3Line,
    title: 'No products yet',
    description: 'Paste a URL below to add one.',
  },
};

export const NoShops: Story = {
  args: {
    icon: RiStore2Line,
    title: 'No shops yet',
    description: 'Shops are added automatically when you save products.',
  },
};
