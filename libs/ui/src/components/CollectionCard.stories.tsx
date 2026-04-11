import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollectionCard } from './CollectionCard';

const meta: Meta<typeof CollectionCard> = {
  title: 'Components/CollectionCard',
  component: CollectionCard,
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CollectionCard>;

export const WithImage: Story = {
  args: {
    name: 'Living Room Lighting',
    color: '#5b8db8',
    imageUrl: 'https://picsum.photos/seed/collection1/400/300',
  },
};

export const NoImage: Story = {
  args: {
    name: 'Kitchen Appliances',
    color: '#4f9a7e',
  },
};

export const LongName: Story = {
  args: {
    name: 'Very Long Collection Name That Should Truncate Nicely',
    color: '#c4883d',
  },
};
