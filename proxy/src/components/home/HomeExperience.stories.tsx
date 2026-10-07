import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { HomeExperience } from './HomeExperience';
const meta = {
  title: 'Homepage',
  component: HomeExperience,
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
  args: { graphics: 'poster', skipEntrance: true },
} satisfies Meta<typeof HomeExperience>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Axolotl: Story = { args: { initialScene: 'cubes' } };
export const EventHorizon: Story = { args: { initialScene: 'horizon' } };
export const UnavailableMusic: Story = {
  args: {
    initialScene: 'cubes',
    resolve: async () => {
      throw new Error('Recording unavailable');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deck = await canvas.findByRole('region', {
      name: 'Information slots',
    });
    await userEvent.click(deck);
    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Play music' })).toBeDisabled(),
    );
    await expect(
      canvas.getByRole('button', { name: 'Next scene' }),
    ).toBeEnabled();
  },
};
export const AttachedCards: Story = {
  args: { initialScene: 'horizon' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deck = await canvas.findByRole('region', {
      name: 'Information slots',
    });
    await userEvent.click(deck);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(deck).toHaveAttribute('data-moving', 'false'));
    const blog = await canvas.findByRole('button', {
      name: 'Blog',
    });
    await userEvent.click(blog);
    await waitFor(() =>
      expect(
        canvas.getByRole('group', { name: 'Current card' }),
      ).toHaveAttribute('data-state', 'open'),
    );
    await expect(
      canvas.getByRole('link', { name: 'Open Blog' }),
    ).toHaveAttribute('href', 'https://royenheart.github.io');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('group', { name: 'Current card' })).toBeNull(),
    );
  },
};
