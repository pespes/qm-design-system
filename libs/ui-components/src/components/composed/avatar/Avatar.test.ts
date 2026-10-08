import type { RefObject } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import type { StoryContext } from '@storybook/react';
import type { AvatarProps } from './Avatar.types.js';

type AvatarPlayContext = StoryContext<AvatarProps>;

// --- Default (photo) Avatar Tests ---
export const defaultTests = async ({
  canvasElement,
  args,
  step,
}: AvatarPlayContext) => {
  const canvas = within(canvasElement);

  await step('Renders the image with alt text once it loads', async () => {
    // The fallback also has role="img" with the same name while loading, so wait for the <img> itself
    await waitFor(() =>
      expect(canvasElement.querySelector('img')).toBeInTheDocument(),
    );
    const image = canvasElement.querySelector('img');
    expect(image).toHaveAccessibleName(args.alt);
    expect(image).toHaveAttribute('src', args.src);
  });

  await step('Hides the fallback once the image has loaded', async () => {
    await waitFor(() =>
      expect(canvas.queryByText(args.fallback)).not.toBeInTheDocument(),
    );
  });

  await step('Fires onLoadingStatusChange with "loaded"', async () => {
    await waitFor(() =>
      expect(args.onLoadingStatusChange).toHaveBeenCalledWith('loaded'),
    );
  });

  await step('Applies the default md size', async () => {
    const root = canvasElement.querySelector('[data-slot="avatar"]');
    expect(root).toHaveAttribute('data-size', 'md');
  });
};

// --- Fallback Avatar Tests ---
export const fallbackTests =
  (ref: RefObject<HTMLSpanElement | null>) =>
  async ({ canvasElement, args, step }: AvatarPlayContext) => {
    const canvas = within(canvasElement);

    await step('Shows initials when no image is provided', async () => {
      expect(canvas.getByText(args.fallback)).toBeInTheDocument();
      expect(canvasElement.querySelector('img')).not.toBeInTheDocument();
    });

    await step('Announces the name instead of the initials', async () => {
      const fallback = canvas.getByRole('img', { name: args.alt });
      expect(fallback).toHaveTextContent(args.fallback);
    });

    await step('Forwards ref to the root element', async () => {
      expect(ref.current).toBe(
        canvasElement.querySelector('[data-slot="avatar"]'),
      );
    });
  };

// --- Broken Image Avatar Tests ---
export const brokenImageTests = async ({
  canvasElement,
  args,
  step,
}: AvatarPlayContext) => {
  const canvas = within(canvasElement);

  await step('Fires onLoadingStatusChange with "error"', async () => {
    await waitFor(() =>
      expect(args.onLoadingStatusChange).toHaveBeenCalledWith('error'),
    );
  });

  await step('Shows the fallback when the image fails to load', async () => {
    expect(canvas.getByRole('img', { name: args.alt })).toHaveTextContent(
      args.fallback,
    );
    expect(canvasElement.querySelector('img')).not.toBeInTheDocument();
  });
};

// --- Size Tests ---
export const sizeTests = async ({ canvasElement, step }: AvatarPlayContext) => {
  await step('Applies each size', async () => {
    const roots = canvasElement.querySelectorAll('[data-slot="avatar"]');
    const sizes = Array.from(roots).map((root) =>
      root.getAttribute('data-size'),
    );
    expect(sizes).toEqual(['sm', 'md', 'lg', 'sm', 'md', 'lg']);
  });
};
