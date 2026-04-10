import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';
const fn = () => () => {};

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  decorators: [(Story) => <div className="w-64"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ProductCard>;

const base = {
  shopName: 'IKEA',
  price: 1299,
  rating: 4,
  onClick: fn(),
  onArchive: fn(),
  onRate: fn(),
};

export const Default: Story = {
  args: { ...base, title: 'Enzo 3-Seater Sofa', status: 'considering', imageUrl: 'https://picsum.photos/seed/card1/400/500' },
};

export const Winner: Story = {
  args: { ...base, title: 'Hugo Corner Sofa', status: 'winner', rating: 5, imageUrl: 'https://picsum.photos/seed/card2/400/500' },
};

export const Purchased: Story = {
  args: { ...base, title: 'Drift 3-Seater', status: 'purchased', imageUrl: 'https://picsum.photos/seed/card3/400/500' },
};

export const PriceDrop: Story = {
  args: { ...base, title: 'Omnidesk Pro 2', status: 'shortlisted', price: 799, originalPrice: 899, imageUrl: 'https://picsum.photos/seed/card4/400/500' },
};

export const Archived: Story = {
  args: { ...base, title: 'Nova Sofa Bed', status: 'considering', archived: true, imageUrl: 'https://picsum.photos/seed/card5/400/500' },
};

export const NoImage: Story = {
  args: { ...base, title: 'New product', status: 'considering', rating: 0, imageUrl: null },
};

export const BigSize: Story = {
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { ...base, title: 'Enzo 3-Seater Sofa', status: 'winner', size: 'big', imageUrl: 'https://picsum.photos/seed/card1/400/300' },
};

export const CompareMode: Story = {
  args: { ...base, title: 'Enzo 3-Seater', status: 'considering', compareMode: true, compareSelected: false, imageUrl: 'https://picsum.photos/seed/card1/400/500' },
};

export const CompareSelected: Story = {
  args: { ...base, title: 'Enzo 3-Seater', status: 'considering', compareMode: true, compareSelected: true, imageUrl: 'https://picsum.photos/seed/card1/400/500' },
};

export const Grid: Story = {
  decorators: [(Story) => <div className="grid grid-cols-3 gap-4 max-w-2xl"><Story /></div>],
  render: () => (
    <>
      <ProductCard {...base} title="Enzo 3-Seater" status="winner" rating={5} imageUrl="https://picsum.photos/seed/g1/400/500" />
      <ProductCard {...base} title="Hugo Corner" status="shortlisted" price={2199} originalPrice={2399} imageUrl="https://picsum.photos/seed/g2/400/500" />
      <ProductCard {...base} title="Nova Sofa Bed" status="considering" rating={2} imageUrl="https://picsum.photos/seed/g3/400/500" />
      <ProductCard {...base} title="Drift 3-Seater" status="purchased" imageUrl="https://picsum.photos/seed/g4/400/500" />
      <ProductCard {...base} title="Arch Boucle" status="shortlisted" rating={3} imageUrl="https://picsum.photos/seed/g5/400/500" />
      <ProductCard {...base} title="Archived Item" status="considering" archived rating={0} imageUrl="https://picsum.photos/seed/g6/400/500" />
    </>
  ),
};
