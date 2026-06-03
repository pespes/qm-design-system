import type { RefObject } from 'react';
import { expect, within } from 'storybook/test';
import type { StoryContext } from '@storybook/react';
import type { BadgeProps, StatusBadgeProps } from './Badge.types.js';

type Props = BadgeProps | StatusBadgeProps;
type BadgePlayContext<T = Props> = StoryContext<T>;

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
    // variations in styling between different options, so just testing 2 to confirm styling changes
    // according to the variant
    const primaryBadge = canvas.getByText(/base badge/i).parentElement;
    expect(primaryBadge?.classList).toContain('bg-primary-background');
    const brandBadge = canvas.getByText(/brand badge/i).parentElement;
    expect(brandBadge?.classList).toContain('bg-brand-background');
    expect(brandBadge?.classList).not.toContain('bg-primary-background');
  });
};

// ---  Variant StatusBadge Tests ---
export const statusVariantTests = async ({
  canvasElement,
  step,
}: BadgePlayContext) => {
  const canvas = within(canvasElement);

  await step('Correctly applies different variants', async () => {
    // variations in styling between different options, so just testing 2 to confirm styling changes
    // according to the variant
    const dangerBadge = canvas.getByText(/danger badge/i).parentElement;
    expect(dangerBadge?.classList).toContain(
      'bg-status-danger-background-subtle',
    );
    const brandBadge = canvas.getByText(/system badge/i).parentElement;
    expect(brandBadge?.classList).toContain('bg-accent-background-subtle');
    expect(brandBadge?.classList).not.toContain(
      'bg-status-danger-background-subtle',
    );
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
