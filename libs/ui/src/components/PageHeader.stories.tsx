import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';
import { Button } from './Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: {
    onOpenSidebar: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: { title: 'Collections' },
};

export const WithActions: Story = {
  args: { title: 'Living Room Lighting' },
  render: (args) => (
    <PageHeader {...args}>
      <Button variant="secondary">Share</Button>
      <Button variant="secondary">Compare</Button>
    </PageHeader>
  ),
};
