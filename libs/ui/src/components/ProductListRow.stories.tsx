import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductListRow } from './ProductListRow';
import type { Product } from '@shelfr/shared';

const baseProduct: Product = {
  id: '1',
  user_id: 'u1',
  collection_id: 'c1',
  title: 'Orla Globe Pendant - Brushed Brass',
  price: 253,
  original_price: 253,
  currency: 'NZD',
  shop_name: 'Lumens',
  shop_domain: 'lumens.com',
  source_url: 'https://lumens.com/product/1',
  image_url: 'https://picsum.photos/seed/pendant/100/100',
  status: 'shortlisted',
  notes: '',
  rating: 3,
  quantity: 1,
  archived: false,
  price_checked_at: null,
  created_at: '2026-01-01',
  added_by: 'u1',
};

const meta: Meta<typeof ProductListRow> = {
  title: 'Components/ProductListRow',
  component: ProductListRow,
  args: {
    product: baseProduct,
    sortBy: 'rating',
    selected: false,
    compareMode: false,
    compareSelected: false,
    onClick: () => {},
    onSelect: () => {},
    onRate: () => {},
    onToggleArchive: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProductListRow>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const MultipleQuantity: Story = {
  args: { product: { ...baseProduct, quantity: 3 } },
};

export const Archived: Story = {
  args: { product: { ...baseProduct, archived: true } },
};
