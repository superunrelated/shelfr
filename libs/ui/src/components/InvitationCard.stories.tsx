import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvitationCard } from './InvitationCard';

const meta: Meta<typeof InvitationCard> = {
  title: 'Components/InvitationCard',
  component: InvitationCard,
  args: {
    onAccept: () => {},
    onDecline: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InvitationCard>;

export const Viewer: Story = {
  args: {
    collectionName: 'Living Room Lighting',
    color: '#5b8db8',
    role: 'viewer',
    inviterEmail: 'sarah@example.com',
  },
};

export const Editor: Story = {
  args: {
    collectionName: 'Kitchen Appliances',
    color: '#4f9a7e',
    role: 'editor',
    inviterEmail: 'alex@example.com',
  },
};
