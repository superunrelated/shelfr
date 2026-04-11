import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProConList } from './ProConList';
const fn = () => () => {};

const meta: Meta<typeof ProConList> = {
  title: 'Components/ProConList',
  component: ProConList,
};
export default meta;
type Story = StoryObj<typeof ProConList>;

export const WithItems: Story = {
  args: {
    pros: ['Great depth', 'Easy to clean', '100 night trial'],
    cons: ['Limited colours', 'Heavy'],
    onAddPro: fn(),
    onAddCon: fn(),
  },
};

export const Empty: Story = {
  args: { pros: [], cons: [], onAddPro: fn(), onAddCon: fn() },
};

export const ReadOnly: Story = {
  args: {
    pros: ['Solid frame', 'Quiet motor'],
    cons: ['Heavy assembly'],
  },
};
