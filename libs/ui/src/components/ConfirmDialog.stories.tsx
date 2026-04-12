import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmDialog } from './ConfirmDialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    onConfirm: () => {},
    onCancel: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
  },
};

export const DeleteProduct: Story = {
  args: {
    title: 'Delete this product?',
    description: 'This will permanently remove it from the collection.',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

export const DeleteCollection: Story = {
  args: {
    title: 'Delete this collection?',
    description: 'All products in this collection will be permanently deleted.',
    confirmLabel: 'Delete collection',
    variant: 'danger',
  },
};

export const DeleteAccount: Story = {
  args: {
    title: 'Delete your account?',
    description:
      'This will permanently delete your account and all your data. This cannot be undone.',
    confirmLabel: 'Delete everything',
    variant: 'danger',
  },
};
