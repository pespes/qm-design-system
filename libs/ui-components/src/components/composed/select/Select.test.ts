import type { StoryContext } from '@storybook/react';
import {
  expect,
  within,
  userEvent,
  fireEvent,
  waitFor,
  screen,
} from 'storybook/test';
import type { RefObject } from 'react';
import type { SelectProps, GroupedItem, FlatItem } from './Select.types.js';

type SelectContext = StoryContext<SelectProps>;

// ---  Default Select Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);

  await step('Select Trigger', async () => {
    const trigger = canvas.getByRole('combobox');
    await step(
      'Trigger renders button with default placeholder text',
      async () => {
        expect(trigger.tagName).toBe('BUTTON');
        expect(
          within(trigger).getByText(/choose an option/i),
        ).toBeInTheDocument();
      },
    );

    await step(
      'Calls onOpenChange, sets aria-expanded, and opens listbox when trigger is clicked',
      async () => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(args.onOpenChange).not.toHaveBeenCalled();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        await userEvent.click(trigger);
        await waitFor(() => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
          expect(args.onOpenChange).toHaveBeenCalledTimes(1);
          expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        //close the listbox for next test
        await userEvent.click(trigger);
      },
    );

    await step(
      'Calls onOpenChange, sets aria-expanded, and opens listbox when trigger is focused and Enter / Space hit',
      async () => {
        await waitFor(() => {
          expect(trigger).toHaveAttribute('aria-expanded', 'false');
        });
        await userEvent.keyboard('{enter}');
        await waitFor(() => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });
        expect(args.onOpenChange).toHaveBeenCalledTimes(3);
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        await userEvent.click(trigger); // close the listbox
        await waitFor(() => {
          expect(trigger).toHaveAttribute('aria-expanded', 'false');
        });
        await userEvent.keyboard(' ');
        await waitFor(() => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });
        expect(args.onOpenChange).toHaveBeenCalledTimes(5);
        await userEvent.click(trigger); // close the listbox
      },
    );

    await step('Renders the selected option label', async () => {
      await userEvent.click(trigger);
      const options = screen.getAllByRole('option');
      if (!options[0]) throw new Error('no options found');
      const optionLabel = options[0].textContent;
      await userEvent.click(options[0]);
      expect(args.onValueChange).toHaveBeenCalledTimes(1);
      expect(within(trigger).getByText(optionLabel)).toBeInTheDocument();
    });
  });

  await step('Select Overlay', async () => {
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    const overlay = screen.getByRole('listbox');
    const options = within(overlay).getAllByRole('option');

    await step('renders all items', async () => {
      const itemsLength = args.items?.length;
      expect(options.length).toBe(itemsLength);
    });

    await step('moves focus with arrow keys', async () => {
      //listbox is open
      await userEvent.keyboard('[ArrowDown]');
      expect(options[1]).toHaveFocus();
      await userEvent.keyboard('[ArrowDown]');
      expect(options[2]).toHaveFocus();
      await userEvent.keyboard('[ArrowUp]');
      expect(options[1]).toHaveFocus();
    });

    await step(
      'hitting "Enter" selects the option and closes the listbox',
      async () => {
        const optionToSelect = options[1];
        if (!optionToSelect) throw new Error('no option found');
        expect(optionToSelect).toHaveFocus();
        await userEvent.keyboard('{enter}');
        expect(args.onValueChange).toHaveBeenCalledTimes(2);
        expect(optionToSelect).toHaveAttribute('aria-selected');
        expect(
          within(trigger).getByText(optionToSelect.textContent),
        ).toBeInTheDocument();
      },
    );
  });
};

// ---  Disabled Select Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');
  await step('Render a disabled trigger', async () => {
    expect(trigger).toBeDisabled();
  });

  await step(
    'does not call onOpenChange when disabled and clicked',
    async () => {
      await userEvent.click(trigger);
      expect(args.onOpenChange).not.toHaveBeenCalled();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    },
  );
};

// ---  Disabled Select - open Tests ---
export const disabledOpenTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await step('does not call onValueChange when disabled', async () => {
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    if (!options[0]) throw new Error('no option found');
    fireEvent.click(options[0]);
    await waitFor(() => {
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  });
};

// ---  Disabled Options in Select Tests ---
export const disabledOptionTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await userEvent.click(trigger);
  await waitFor(() => {
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  const options = screen.getAllByRole('option');

  await step('Disabled option has data-disabled attribute', async () => {
    expect(options[0]).not.toHaveAttribute('aria-disabled');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
  });

  await step(
    'Clicking a disabled option does not call onValueChange',
    async () => {
      if (!options[1]) throw new Error('no option found');
      fireEvent.click(options[1]);
      await waitFor(() => {
        expect(args.onValueChange).not.toHaveBeenCalled();
      });
    },
  );

  await step('Non-disabled options are still selectable', async () => {
    if (!options[0]) throw new Error('no option found');
    await userEvent.click(options[0]);
    expect(args.onValueChange).toHaveBeenCalledTimes(1);
  });
};

// ---  Invalid Select & Ref Tests ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await step('passes aria-invalid to the trigger when error=true', async () => {
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  await step('Correctly passes the inputRef to the input', async () => {
    const ref = args.inputRef as RefObject<HTMLInputElement>;
    const input = ref.current;
    expect(input.tagName).toBe('INPUT');
  });

  await step('Correctly passes the ref to the trigger', async () => {
    const ref = args.ref as RefObject<HTMLButtonElement>;
    const trigger = ref.current;
    expect(trigger.tagName).toBe('BUTTON');
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  await step('Correctly passes the option ref to the option', async () => {
    const firstItem = (args.items as FlatItem[])[0];
    if (!firstItem) throw new Error('no option found');
    const ref = firstItem.ref as RefObject<HTMLDivElement>;
    const option = ref.current;
    expect(option).toHaveTextContent(firstItem.label as string);
    await userEvent.click(option);
    await waitFor(() => {
      expect(trigger).toHaveTextContent(firstItem.label as string);
    });
  });
};

// ---  Grouped Select Tests ---
export const groupedTests = async ({
  args,
  canvasElement,
  step,
}: SelectContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');
  await userEvent.click(trigger);
  const overlay = await screen.findByRole('listbox');
  const itemGroups = within(overlay).getAllByRole('group');

  await step('Renders correct number of groups with role="group"', async () => {
    const groupItemsCount = args.items?.length;
    expect(itemGroups.length).toBe(groupItemsCount);
  });

  await step('Renders appropriate label for grouping', async () => {
    const firstGroup = itemGroups[0];
    const firstGroupLabel = (args.items as GroupedItem[])?.[0];
    if (!firstGroupLabel) throw new Error('no items provided');
    expect(firstGroup).toHaveAccessibleName(
      firstGroupLabel.groupLabel as string,
    );
  });
};
