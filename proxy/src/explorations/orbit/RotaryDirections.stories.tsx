import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { OrbitStudy } from './OrbitStudy';
import { sceneTracks } from '../../lib/music/scene-tracks';
import { resolvePublicAudio } from '../../lib/music/sources';

const meta = {
  title: 'Explorations/Rotary directions',
  component: OrbitStudy,
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
  args: {
    initialScene: 'horizon',
    skipEntrance: true,
    startOpen: true,
    tracks: sceneTracks,
    resolve: resolvePublicAudio,
    cardDuration: 0.68,
  },
  argTypes: {
    dockDesign: {
      type: 'string',
      control: 'radio',
      options: ['classic', 'tangent', 'drum', 'orbit'],
    },
    cardDuration: {
      control: { type: 'range', min: 0.35, max: 1.2, step: 0.05 },
    },
  },
} satisfies Meta<typeof OrbitStudy>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TangentGlass: Story = { args: { dockDesign: 'tangent' } };
export const VelvetDrum: Story = { args: { dockDesign: 'drum' } };
export const OrbitalRibbon: Story = { args: { dockDesign: 'orbit' } };
export const TangentCubes: Story = {
  args: { dockDesign: 'tangent', initialScene: 'cubes' },
};
export const DrumCubes: Story = {
  args: { dockDesign: 'drum', initialScene: 'cubes' },
};
export const OrbitalCubes: Story = {
  args: { dockDesign: 'orbit', initialScene: 'cubes' },
};
export const InterruptedDrum: Story = {
  args: { dockDesign: 'drum', graphics: 'poster' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (let i = 0; i < 3; i++)
      await userEvent.click(canvas.getByRole('button', { name: 'Next card' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous card' }),
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('.rotary-deck')).toHaveAttribute(
        'data-moving',
        'false',
      ),
    );
    await expect(canvas.getByRole('article')).toHaveAccessibleName('GitHub');
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.getByRole('button', { name: 'Open information cards' }),
    ).toHaveFocus();
  },
};
