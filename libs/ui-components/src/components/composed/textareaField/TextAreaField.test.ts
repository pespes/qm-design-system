import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { TextAreaFieldProps } from './TextAreaField.types.js';

type TextAreaFieldPlayContext = StoryContext<TextAreaFieldProps>;

// --- Default TextAreaField Test (id provided by dev) ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label correctly connects to textarea via provided id', () => {
    if (!args.id) throw new Error('id arg is required for this story');
    const label = canvas.getByText('I am a Label');
    const textarea = canvas.getByRole('textbox');
    expect(textarea.id).toBe(args.id);
    expect(label).toHaveAttribute('for', args.id);
  });

  await step('Correctly passes the testId to the textarea', () => {
    if (!args.testId) throw new Error('testId arg is required for this story');
    const textarea = canvas.getByTestId(args.testId);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  await step('Label focuses textarea when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    const textarea = canvas.getByRole('textbox');
    expect(textarea).not.toHaveFocus();
    await userEvent.click(label);
    expect(textarea).toHaveFocus();
  });

  await step('Correctly passes the ref through to the textarea', async () => {
    const ref = args.ref as RefObject<HTMLTextAreaElement>;
    const textarea = ref.current;
    expect(textarea.tagName).toBe('TEXTAREA');
    await userEvent.click(textarea);
    expect(textarea).toHaveFocus();
  });

  await step('Textarea triggers onChange when user types', async () => {
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toHaveFocus(); // already has focus from previous test
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('t');
    expect(args.onChange).toHaveBeenCalledTimes(1);
  });
};

// --- Generated id TextAreaField Test (no id provided) ---
export const generatedIdTests = async ({
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label correctly connects to textarea via generated id', () => {
    const label = canvas.getByText('I am a Label');
    const textarea = canvas.getByRole('textbox');
    expect(textarea.id).toBeTruthy();
    expect(label).toHaveAttribute('for', textarea.id);
  });

  await step('Label focuses textarea when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    const textarea = canvas.getByRole('textbox');
    expect(textarea).not.toHaveFocus();
    await userEvent.click(label);
    expect(textarea).toHaveFocus();
  });
};

// --- Disabled TextAreaField Test ---
export const disabledTests = async ({
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label correctly connects to textarea', () => {
    const label = canvas.getByText('I am a Label');
    const textarea = canvas.getByRole('textbox');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  await step(
    'Label does not focus disabled textarea when clicked',
    async () => {
      const label = canvas.getByText('I am a Label');
      const textarea = canvas.getByRole('textbox');
      expect(textarea).not.toHaveFocus();
      await userEvent.click(label);
      expect(textarea).not.toHaveFocus();
    },
  );
};
