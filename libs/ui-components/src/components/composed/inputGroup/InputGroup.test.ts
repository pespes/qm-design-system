import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { InputGroupProps } from './InputGroup.types.js';

type InputGroupPlayContext = StoryContext<InputGroupProps>;

// ---  Default InputGroup Test ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: InputGroupPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label correctly connects to input', () => {
    const label = canvas.getByText('I am a Label');
    const input = canvas.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  await step('Correctly passes the testId to the input', () => {
    // Required in order to allow passing of args.testId to 'getByTestId' without
    // typescript complaint, even though we deliberately pass a testId in the args
    if (!args.testId) throw new Error('testId arg is required for this story');
    const input = canvas.getByTestId(args.testId);
    expect(input.tagName).toBe('INPUT');
  });

  await step('Label focuses input when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    const input = canvas.getByRole('textbox');
    expect(input).not.toHaveFocus();
    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  await step('Correctly passes the ref through to the input', async () => {
    const ref = args.ref as RefObject<HTMLInputElement>;
    const input = ref.current;
    expect(input.tagName).toBe('INPUT');
    await userEvent.click(input);
    expect(input).toHaveFocus();
  });
};

// ---  Disabled InputGroup Test ---
export const disabledTests = async ({
  canvasElement,
  step,
}: InputGroupPlayContext) => {
  const canvas = within(canvasElement);

  // a similar test as one in DefaultTests, for when an id is not supplied by dev
  await step('Label correctly connects to input', () => {
    const label = canvas.getByText('I am a Label');
    const input = canvas.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  await step('Label focuses input when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    const input = canvas.getByRole('textbox');
    expect(input).not.toHaveFocus();
    await userEvent.click(label);
    expect(input).not.toHaveFocus();
  });
};
