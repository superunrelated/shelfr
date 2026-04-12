import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductGridCard } from './ProductGridCard';
import type { Product } from '@shelfr/shared';

const baseProduct: Product = {
  id: '1',
  user_id: 'u1',
  collection_id: 'c1',
  title: 'Orla Globe Pendant - Brushed Brass',
  price: 253,
  original_price: 299,
  currency: 'NZD',
  shop_name: 'Lumens',
  shop_domain: 'lumens.com',
  source_url: 'https://lumens.com/product/1',
  image_url: 'https://picsum.photos/seed/pendant/400/300',
  status: 'considering',
  notes: '',
  rating: 4,
  quantity: 1,
  archived: false,
  price_checked_at: null,
  created_at: '2026-01-01',
  added_by: 'u1',
};

const meta: Meta<typeof ProductGridCard> = {
  title: 'Components/ProductGridCard',
  component: ProductGridCard,
  args: {
    product: baseProduct,
    viewMode: 'big',
    selected: false,
    compareMode: false,
    compareSelected: false,
    onClick: () => {},
    onSelect: () => {},
    onRate: () => {},
    onToggleArchive: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProductGridCard>;

export const Default: Story = {};

export const Winner: Story = {
  args: { product: { ...baseProduct, status: 'winner' } },
};

export const PriceDrop: Story = {
  args: { product: { ...baseProduct, price: 199, original_price: 253 } },
};

export const Selected: Story = {
  args: { selected: true },
};

export const CompareMode: Story = {
  args: { compareMode: true, compareSelected: true },
};

export const Compact: Story = {
  args: { viewMode: 'compact' },
  decorators: [
    (Story) => (
      <div className="w-36">
        <Story />
      </div>
    ),
  ],
};

export const NoImage: Story = {
  args: { product: { ...baseProduct, image_url: null } },
};

export const Archived: Story = {
  args: { product: { ...baseProduct, archived: true } },
};
