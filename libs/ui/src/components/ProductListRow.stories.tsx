import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductListRow } from './ProductListRow';
const fn = () => () => {};

const meta: Meta<typeof ProductListRow> = {
  title: 'Components/ProductListRow',
  component: ProductListRow,
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ProductListRow>;

const base = { shopName: 'IKEA', price: 1299, rating: 4, onClick: fn(), onArchive: fn(), onRate: fn() };

export const Default: Story = {
  args: { ...base, title: 'Enzo 3-Seater Sofa', status: 'considering', imageUrl: 'https://picsum.photos/seed/lr1/100/100' },
};

export const Winner: Story = {
  args: { ...base, title: 'Hugo Corner Sofa', status: 'winner', rating: 5, imageUrl: 'https://picsum.photos/seed/lr2/100/100' },
};

export const Archived: Story = {
  args: { ...base, title: 'Old Item', status: 'considering', archived: true, imageUrl: 'https://picsum.photos/seed/lr3/100/100' },
};

export const ListView: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ProductListRow {...base} title="Enzo 3-Seater" status="winner" rating={5} imageUrl="https://picsum.photos/seed/l1/100/100" />
      <ProductListRow {...base} title="Hugo Corner Sofa" status="shortlisted" price={2199} imageUrl="https://picsum.photos/seed/l2/100/100" />
      <ProductListRow {...base} title="Nova Sofa Bed" status="considering" rating={2} price={899} imageUrl="https://picsum.photos/seed/l3/100/100" />
      <ProductListRow {...base} title="Archived" status="considering" archived rating={0} price={450} imageUrl="https://picsum.photos/seed/l4/100/100" />
    </div>
  ),
};
