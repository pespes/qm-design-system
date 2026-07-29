import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { TextAreaProps } from './TextArea.types.js';

type TextAreaPlayContext = StoryContext<TextAreaProps>;
const MIN_TEXTAREA_HEIGHT = 68;
const USER_CHARS_ENTERED = 10;
const LINE_HEIGHT = 21;
const PADDING = 10;

// --- Default Textarea Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    'Textarea correctly renders textarea with placeholder',
    async () => {
      const textarea = canvas.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('placeholder', args.placeholder);
    },
  );

  await step('Correctly passes the testId to the textarea', () => {
    if (!args.testId) throw new Error('testId arg is required for this story');
    const textarea = canvas.getByTestId(args.testId);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  await step(
    'Textarea triggers onChange and updates value when user types',
    async () => {
      const textarea = canvas.getByRole('textbox');
      await userEvent.tab();
      expect(textarea).toHaveFocus();
      expect(args.onChange).not.toHaveBeenCalled();
      await userEvent.keyboard('t');
      expect(args.onChange).toHaveBeenCalledTimes(1);
      expect(textarea).toHaveValue('t');
    },
  );
};

// --- Disabled Textarea Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step('Disabled textarea is not focusable via tab', async () => {
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toBeDisabled();

    await userEvent.tab();
    expect(textarea).not.toHaveFocus();
  });

  await step('Disabled textarea does not fire onChange event', async () => {
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toBeDisabled();

    await userEvent.type(textarea, 't');
    expect(args.onChange).not.toHaveBeenCalled();
  });
};

// --- Invalid and Default testId Textarea Tests ---
export const invalidTests = async ({
  canvasElement,
  step,
  args,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step('aria-invalid is forwarded to native textarea', async () => {
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  await step(
    'Falls back to the default testId when none is provided',
    async () => {
      const textarea = canvas.getByTestId('input-group-textarea');
      expect(textarea.tagName).toBe('TEXTAREA');
    },
  );

  await step('Passes ref to the textarea', async () => {
    const ref = args.ref as RefObject<HTMLTextAreaElement>;
    const textarea = ref.current;
    expect(textarea.tagName).toBe('TEXTAREA');
  });
};

// --- MaxLength Textarea Tests ---
export const maxLengthTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    'maxLength attribute is forwarded to native textarea',
    async () => {
      if (!args.maxLength)
        throw new Error('maxLength arg is required for this story');
      const textarea = canvas.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', args.maxLength.toString());
    },
  );

  await step('translateFn called if user reaches maxLength', async () => {
    if (!args.maxLength) {
      throw new Error('maxLength arg is required for this story');
    }
    const textarea = canvas.getByRole('textbox');
    expect(args.maxLengthSRFunc).not.toHaveBeenCalled();

    const longText = 'a'.repeat(args.maxLength + USER_CHARS_ENTERED);
    await userEvent.type(textarea, longText);

    expect(args.maxLengthSRFunc).toHaveBeenCalledTimes(1);
    await userEvent.clear(textarea);
  });

  await step('User cannot type beyond maxLength', async () => {
    if (!args.maxLength) {
      throw new Error('maxLength arg is required for this story');
    }
    const textarea = canvas.getByRole('textbox');
    const longText = 'a'.repeat(args.maxLength + USER_CHARS_ENTERED);
    await userEvent.type(textarea, longText);

    expect(textarea).toHaveValue('a'.repeat(args.maxLength));
  });

  await step('Character counter updates as user types', async () => {
    if (!args.maxLength)
      throw new Error('maxLength arg is required for this story');
    const textareaWrapper = canvas.getByRole('group');
    const textarea = canvas.getByRole('textbox');
    await userEvent.clear(textarea);

    const longText = 'a'.repeat(USER_CHARS_ENTERED);
    await userEvent.type(textarea, longText);

    expect(textarea).toHaveValue('a'.repeat(USER_CHARS_ENTERED));
    const counter = textareaWrapper.querySelector(
      '[data-slot="input-group-text"]',
    );
    expect(counter).toHaveTextContent(
      `${USER_CHARS_ENTERED} / ${args.maxLength}`,
    );

    await userEvent.type(textarea, '{backspace}');
    expect(counter).toHaveTextContent(
      `${USER_CHARS_ENTERED - 1} / ${args.maxLength}`,
    );
  });

  await step('Textarea has aria-describedby set to counter value', async () => {
    const textarea = canvas.getByRole('textbox');
    const textareaWrapper = canvas.getByRole('group');
    const counter = textareaWrapper.querySelector(
      '[data-slot="input-group-text"]',
    );
    expect(textarea).toHaveAttribute('aria-describedby', counter?.id);
  });
};

// --- Fixed-size (rows) Textarea Tests ---
export const fixedSizeTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step('rows attribute is forwarded to native textarea', async () => {
    if (!args.rows) throw new Error('rows arg is required for this story');
    const textarea = canvas.getByTestId('fixed-textarea-large');
    expect(textarea).toHaveAttribute('rows', args.rows.toString());
  });

  await step(
    'Rendered height exceeds the 68px minimum when rows > 2',
    async () => {
      const textareaWrapper = canvas.getByTestId(
        'fixed-textarea-large',
      ).parentElement; //need to trigger the wrapper
      if (!textareaWrapper) {
        throw new Error('Textarea wrapper not found');
      }
      const renderedHeight = parseInt(
        window.getComputedStyle(textareaWrapper).height,
        10,
      );
      expect(renderedHeight).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);
    },
  );

  await step(
    'Rendered height retains 68px minimum height when rows <= 2',
    async () => {
      const textareaWrapper =
        canvas.getByTestId('fixed-textarea-min').parentElement; //need to trigger the wrapper
      if (!textareaWrapper) {
        throw new Error('Textarea wrapper not found');
      }
      const renderedHeight = parseInt(
        window.getComputedStyle(textareaWrapper).height,
        10,
      );
      expect(renderedHeight).toBe(MIN_TEXTAREA_HEIGHT);
    },
  );
};

// --- Auto-grow Textarea Tests ---
export const autoGrowTests = async ({
  canvasElement,
  step,
}: TextAreaPlayContext) => {
  const canvas = within(canvasElement);

  await step('Textarea grows in height as content wraps', async () => {
    const textarea = canvas.getByRole('textbox');
    const textareaWrapper =
      canvas.getByTestId('auto-grow-textarea').parentElement;
    if (!textareaWrapper) {
      throw new Error('textarea wrapper not found');
    }
    const initialHeight = parseInt(
      window.getComputedStyle(textareaWrapper).height,
      10,
    );
    expect(initialHeight).toBe(MIN_TEXTAREA_HEIGHT);

    await userEvent.click(textarea);
    await userEvent.keyboard(
      'This is a long sentence that should wrap onto multiple lines inside a fixed-width container and force the textarea to grow taller than its initial minimum height.',
    );

    const grownHeight = parseInt(
      window.getComputedStyle(textareaWrapper).height,
      10,
    );
    expect(grownHeight).toBeGreaterThan(initialHeight);
    //6 lines of text, top and bottom padding, 2px for border
    const calculatedHeight = LINE_HEIGHT * 6 + PADDING * 2 + 2;
    expect(grownHeight).toBe(calculatedHeight);
  });
};
