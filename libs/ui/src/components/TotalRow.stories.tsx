import type { Meta, StoryObj } from '@storybook/react-vite';
import { TotalRow } from './TotalRow';
import type { Product } from '@shelfr/shared';

const products: Product[] = [
  {
    id: '1',
    user_id: 'u1',
    collection_id: 'c1',
    title: 'Pendant Light',
    price: 253,
    original_price: 253,
    currency: 'NZD',
    shop_name: 'Lumens',
    shop_domain: 'lumens.com',
    source_url: '',
    image_url: null,
    status: 'winner',
    notes: '',
    rating: 4,
    quantity: 1,
    archived: false,
    price_checked_at: null,
    created_at: '2026-01-01',
    added_by: 'u1',
  },
  {
    id: '2',
    user_id: 'u1',
    collection_id: 'c1',
    title: 'Floor Lamp',
    price: 189,
    original_price: 189,
    currency: 'NZD',
    shop_name: 'West Elm',
    shop_domain: 'westelm.com',
    source_url: '',
    image_url: null,
    status: 'considering',
    notes: '',
    rating: 0,
    quantity: 2,
    archived: false,
    price_checked_at: null,
    created_at: '2026-01-01',
    added_by: 'u1',
  },
];

const meta: Meta<typeof TotalRow> = {
  title: 'Components/TotalRow',
  component: TotalRow,
  args: { items: products, label: 'Total' },
};
export default meta;
type Story = StoryObj<typeof TotalRow>;

export const Default: Story = {};

export const PurchaseTotal: Story = {
  args: { label: 'Purchase total' },
};
