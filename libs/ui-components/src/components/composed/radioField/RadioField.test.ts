import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RadioFieldProps } from './RadioField.types.js';

type RadioFieldPlayContext = StoryContext<RadioFieldProps>;

// --- Default RadioField Test ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: RadioFieldPlayContext) => {
  const canvas = within(canvasElement);
  const radioGroup = canvas.getByRole('radiogroup');
  const firstRadio = canvas.getAllByRole('radio')[0];
  const secondRadio = canvas.getAllByRole('radio')[1];

  await step('Legend correctly labels the radio group', () => {
    const legend = canvas.getByText('A FieldSet Label');
    expect(legend.tagName).toBe('LEGEND');
    expect(radioGroup).toHaveAccessibleName(args.label);
  });

  await step('One radio can be selected via click at a time', async () => {
    expect(firstRadio).not.toBeChecked();
    if (!firstRadio) throw new Error('no radio found');
    await userEvent.click(firstRadio);
    expect(firstRadio).toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('value 1');
    if (!secondRadio) throw new Error('no radio found');
    await userEvent.click(secondRadio);
    expect(secondRadio).toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('value 2');
    expect(firstRadio).not.toBeChecked();
  });
};

// --- RadioField Description Test ---
export const descriptionTests = async ({
  args,
  canvasElement,
  step,
}: RadioFieldPlayContext) => {
  const canvas = within(canvasElement);
  const radioGroup = canvas.getByRole('radiogroup');
  const firstRadio = canvas.getAllByRole('radio')[0];

  await step('Description correctly describes the radio group', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    expect(radioGroup).toHaveAccessibleDescription(descriptionText);
  });

  await step('RadioItem descriptions describe individual radios', () => {
    if (!args.options[0] || !firstRadio) throw new Error('no radio found');
    const radioText = args?.options[0].description as string;
    expect(canvas.getByText(radioText)).toBeInTheDocument();
    expect(firstRadio).toHaveAccessibleDescription(radioText);
  });
};

// --- Disabled RadioField Test ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: RadioFieldPlayContext) => {
  const canvas = within(canvasElement);
  const radioGroup = canvas.getAllByRole('group')[0];
  const radios = canvas.getAllByRole('radio');

  await step(
    'Assigns data-disabled to FieldSet and disables all radios',
    () => {
      expect(radioGroup).toHaveAttribute('data-disabled', 'true');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-disabled', 'true');
      });
    },
  );

  await step('Disabled radios cannot be selected', async () => {
    const firstRadio = radios[0];
    if (!firstRadio) throw new Error('no radio found');
    expect(firstRadio).not.toBeChecked();
    await userEvent.click(firstRadio);
    expect(args.onValueChange).not.toHaveBeenCalled();
    expect(firstRadio).not.toBeChecked();
  });
};

// --- Invalid & Required RadioField Test ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: RadioFieldPlayContext) => {
  const canvas = within(canvasElement);
  const fieldSet = canvas.getAllByRole('group')[0];
  const radioGroup = canvas.getByRole('radiogroup');
  const radios = canvas.getAllByRole('radio');

  await step(
    'Error correctly renders and describes alongside description the radio group',
    () => {
      const errorText = args?.error as string;
      expect(canvas.getByText(errorText)).toBeInTheDocument();
      expect(radioGroup).toHaveAccessibleDescription(
        `${args.description} ${errorText}`,
      );
    },
  );

  await step(
    'Passes aria-invalid to radios and assigns data-invalid to FieldSet',
    () => {
      expect(fieldSet).toHaveAttribute('data-invalid', 'true');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-invalid', 'true');
      });
    },
  );

  await step('Assigns data-required to FieldSet', () => {
    expect(fieldSet).toHaveAttribute('data-required', 'true');
  });

  await step('Assigns aria-required to RadioGroup, not radios', () => {
    expect(radioGroup).toHaveAttribute('aria-required', 'true');
    radios.forEach((radio) => {
      expect(radio).not.toHaveAttribute('aria-required');
    });
  });
};
