import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceDisplay } from './PriceDisplay';

const meta: Meta<typeof PriceDisplay> = { title: 'Components/PriceDisplay', component: PriceDisplay };
export default meta;
type Story = StoryObj<typeof PriceDisplay>;

export const Default: Story = { args: { price: 1299 } };
export const WithDrop: Story = { args: { price: 1099, originalPrice: 1299 } };
export const Muted: Story = { args: { price: 899, muted: true } };
export const Large: Story = { args: { price: 2599, originalPrice: 2999, size: 'lg' } };
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <PriceDisplay price={1299} originalPrice={1499} size="sm" />
      <PriceDisplay price={1299} originalPrice={1499} size="md" />
      <PriceDisplay price={1299} originalPrice={1499} size="lg" />
    </div>
  ),
};
