import type { RefObject } from 'react';
import { expect, within } from 'storybook/test';
import type { StoryContext } from '@storybook/react';
import type { BadgeProps } from './Badge.types.js';

type BadgePlayContext = StoryContext<BadgeProps>;

// ---  Default Badge Tests ---
export const defaultTests = async ({
  canvasElement,
  step,
}: BadgePlayContext) => {
  const canvas = within(canvasElement);

  await step('Renders with correct text content', async () => {
    // this targets the text content wrapped in the <span>, so query the parent "Badge" element
    const badge = canvas.getByText(/badge/i).parentElement;
    expect(badge).toBeInTheDocument();
  });

  await step('Renders as a span by default', async () => {
    const badge = canvas.getByText(/badge/i).parentElement;
    expect(badge?.tagName).toBe('SPAN');
  });
};

// ---  Variant Badge Tests ---
export const variantTests = async ({
  canvasElement,
  step,
}: BadgePlayContext) => {
  const canvas = within(canvasElement);
  await step('Correctly applies different variants', async () => {
    // variations in styling between different options, so just testing 3 to confirm styling changes
    // according to the variant
    const baseBadge = canvas.getByText(/base badge/i).parentElement;
    expect(baseBadge?.classList).toContain('bg-base-background');
    const brandBadge = canvas.getByText(/brand badge/i).parentElement;
    expect(brandBadge?.classList).toContain('bg-brand-background');
    const dangerBadge = canvas.getByText(/danger badge/i).parentElement;
    expect(dangerBadge?.classList).toContain('bg-danger-background-subtle');
  });
};

// ---  Icon Badge Tests ---
export const iconTests = async ({ canvasElement, step }: BadgePlayContext) => {
  const canvas = within(canvasElement);

  for (const position of ['left', 'right']) {
    await step(
      `Renders aria-hidden icon in correct order when position is ${position}`,
      async () => {
        const badge = canvas.getByTestId(`badge-icon-${position}`);
        const icon = badge.querySelector('[data-slot="icon"]');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
        const iconChild =
          position === 'left'
            ? badge.firstElementChild
            : badge.lastElementChild;
        expect(iconChild).toBe(icon);
      },
    );
  }
};

// ---  Polymorphic & Ref Badge Tests ---
export const polymorphicTests = async ({
  args,
  canvasElement,
  step,
}: BadgePlayContext) => {
  const canvas = within(canvasElement);
  await step(
    'Renders provided HTML tag when render prop is provided',
    async () => {
      const badge = canvas.getByText(/badge/i).parentElement;
      expect(badge?.tagName).toBe('DIV');
    },
  );

  await step('Ref points to the correct DOM element', async () => {
    const ref = args.ref as RefObject<HTMLInputElement>;
    const badge = ref.current;
    expect(badge.tagName).toBe('DIV');
    expect(badge).toHaveTextContent('A Div Badge');
  });
};
