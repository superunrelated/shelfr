import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrapePreviewModal } from './ScrapePreviewModal';

const meta: Meta<typeof ScrapePreviewModal> = {
  title: 'Components/ScrapePreviewModal',
  component: ScrapePreviewModal,
  args: {
    currentTitle: 'Orla Globe Pendant',
    currentPrice: 299,
    currentImageUrl: 'https://picsum.photos/seed/old/400/300',
    currentShopName: 'Lumens',
    onApply: () => {},
    onDismiss: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ScrapePreviewModal>;

export const PriceDrop: Story = {
  args: {
    preview: {
      title: 'Orla Globe Pendant - Brushed Brass',
      image_url: 'https://picsum.photos/seed/new/400/300',
      price: 253,
      shop_name: 'Lumens',
    },
  },
};

export const PriceIncrease: Story = {
  args: {
    preview: {
      title: 'Orla Globe Pendant',
      price: 329,
    },
  },
};

export const NewImage: Story = {
  args: {
    preview: {
      image_url: 'https://picsum.photos/seed/updated/400/300',
    },
  },
};

export const TitleChange: Story = {
  args: {
    preview: {
      title: 'Orla Globe Pendant - Limited Edition',
      price: 299,
    },
  },
};
