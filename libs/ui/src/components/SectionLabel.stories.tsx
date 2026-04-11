import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionLabel } from './SectionLabel';

const meta: Meta<typeof SectionLabel> = {
  title: 'Components/SectionLabel',
  component: SectionLabel,
};
export default meta;
type Story = StoryObj<typeof SectionLabel>;

export const Default: Story = { args: { children: 'Rating' } };
export const Status: Story = { args: { children: 'Status' } };
export const Notes: Story = { args: { children: 'Notes' } };
