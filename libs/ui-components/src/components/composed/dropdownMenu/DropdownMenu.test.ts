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
import type {
  DropdownMenuProps,
  DropdownMenuItemType,
  DropdownMenuGroupType,
} from './DropdownMenu.types.js';

type DropdownMenuContext = StoryContext<DropdownMenuProps>;

async function waitForMenuClosed() {
  await waitFor(() => {
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
}

/**
 * The popup renders in a portal, so it is only reachable through `screen`.
 * Selecting an item closes the menu, so wait for the close to settle before
 * clicking the trigger again — otherwise the click races the exit transition.
 */
async function openMenu(trigger: HTMLElement) {
  await waitForMenuClosed();
  await userEvent.click(trigger);
  return screen.findByRole('menu');
}

// --- Default Menu Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);
  const items = args.items as DropdownMenuItemType[];

  await step('Trigger renders as a button with the supplied label', () => {
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveTextContent(args.triggerLabel);
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  await step('Clicking the trigger opens the menu', async () => {
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    const menu = await openMenu(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(items.length);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  await step('Enter on the focused trigger opens the menu', async () => {
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  // Labels are not unique across a menu, so rows are addressed by test id.
  await step('Every item renders its label and any key command', async () => {
    const menu = await openMenu(trigger);
    for (const item of items) {
      const row = within(menu).getByTestId(`dropdown-menu-item-${item.value}`);
      expect(row).toHaveTextContent(item.label);
      if (item.shortcut) {
        expect(row).toHaveTextContent(item.shortcut);
      }
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  await step(
    'Selecting an item fires onClick and closes the menu',
    async () => {
      const menu = await openMenu(trigger);
      const [firstItem] = items;
      if (!firstItem) throw new Error('Expected at least one item');

      await userEvent.click(
        within(menu).getByTestId(`dropdown-menu-item-${firstItem.value}`),
      );
      await waitFor(() => {
        expect(firstItem.onClick).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    },
  );
};

// --- Disabled Trigger Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);

  await step('Trigger is marked disabled', () => {
    expect(trigger).toBeDisabled();
  });

  await step('Disabled trigger does not open the menu', async () => {
    // userEvent.click is swallowed by pointer-events:none, so dispatch directly.
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
};

// --- Disabled & Destructive Item Tests ---
export const itemStateTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);
  const items = args.items as DropdownMenuItemType[];
  const disabledItem = items.find((item) => item.disabled);
  const destructiveItem = items.find((item) => item.variant === 'destructive');

  await step('Disabled item is exposed as disabled and inert', async () => {
    if (!disabledItem) throw new Error('Expected a disabled item');
    const menu = await openMenu(trigger);
    const row = within(menu).getByTestId(
      `dropdown-menu-item-${disabledItem.value}`,
    );

    expect(row).toHaveAttribute('data-disabled');
    expect(row).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(row);
    await waitFor(() => {
      expect(disabledItem.onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  await step('Destructive item is flagged for danger styling', async () => {
    if (!destructiveItem) throw new Error('Expected a destructive item');
    const menu = await openMenu(trigger);
    const row = within(menu).getByTestId(
      `dropdown-menu-item-${destructiveItem.value}`,
    );

    expect(row).toHaveAttribute('data-variant', 'destructive');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
};

// --- Grouped Items Tests ---
export const groupedTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);
  const groups = args.items as DropdownMenuGroupType[];

  await step('Each group renders its label and items', async () => {
    const menu = await openMenu(trigger);

    for (const group of groups) {
      expect(within(menu).getByText(group.groupLabel)).toBeInTheDocument();
      for (const item of group.items) {
        expect(
          within(menu).getByTestId(`dropdown-menu-item-${item.value}`),
        ).toHaveTextContent(item.label);
      }
    }

    const totalItems = groups.reduce(
      (count, group) => count + group.items.length,
      0,
    );
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(totalItems);
  });

  await step('Group label names its group for assistive tech', async () => {
    const menu = await screen.findByRole('menu');
    const [firstGroup] = groups;
    if (!firstGroup) throw new Error('Expected at least one group');

    expect(
      within(menu).getByRole('group', { name: firstGroup.groupLabel }),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
};

// --- Radio Type Tests ---
export const radioTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);
  const items = args.items as DropdownMenuItemType[];

  await step('Items expose the menuitemradio role', async () => {
    const menu = await openMenu(trigger);
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(
      items.length,
    );
  });

  await step('Selecting a radio item reports the new value', async () => {
    const menu = await screen.findByRole('menu');
    const target = items[1];
    if (!target) throw new Error('Expected at least two items');

    await userEvent.click(
      within(menu).getByTestId(`dropdown-menu-item-${target.value}`),
    );
    await waitFor(() => {
      expect(args.onValueChange).toHaveBeenCalledWith(target.value);
    });
  });

  // Base UI radio items default to `closeOnClick: false`, so the menu is
  // still open here and the selection can be asserted without reopening.
  await step('Selection is reflected as checked, menu stays open', async () => {
    const menu = await screen.findByRole('menu');
    const target = items[1];
    if (!target) throw new Error('Expected at least two items');

    await waitFor(() => {
      expect(
        within(menu).getByTestId(`dropdown-menu-item-${target.value}`),
      ).toHaveAttribute('aria-checked', 'true');
    });

    for (const item of items) {
      if (item.value === target.value) continue;
      expect(
        within(menu).getByTestId(`dropdown-menu-item-${item.value}`),
      ).toHaveAttribute('aria-checked', 'false');
    }

    await userEvent.keyboard('{Escape}');
    await waitForMenuClosed();
  });
};

// --- Checkbox Type Tests ---
export const checkboxTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);
  const items = args.items as DropdownMenuItemType[];

  await step('Items expose the menuitemcheckbox role', async () => {
    const menu = await openMenu(trigger);
    expect(within(menu).getAllByRole('menuitemcheckbox')).toHaveLength(
      items.length,
    );
  });

  await step('Initial checked state is reflected in aria-checked', async () => {
    const menu = await screen.findByRole('menu');
    for (const item of items) {
      expect(
        within(menu).getByTestId(`dropdown-menu-item-${item.value}`),
      ).toHaveAttribute('aria-checked', String(Boolean(item.checked)));
    }
  });

  await step('Toggling an item reports its value and next state', async () => {
    const menu = await screen.findByRole('menu');
    const target = items[0];
    if (!target) throw new Error('Expected at least one item');

    await userEvent.click(
      within(menu).getByTestId(`dropdown-menu-item-${target.value}`),
    );
    await waitFor(() => {
      expect(args.onCheckedChange).toHaveBeenCalledWith(
        target.value,
        !target.checked,
      );
    });
  });

  await step('Menu stays open after toggling a checkbox item', async () => {
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
};

// --- Forwarded Ref Tests ---
export const refTests = async ({
  args,
  canvasElement,
  step,
}: DropdownMenuContext & {
  args: { ref?: RefObject<HTMLButtonElement | null> };
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByTestId(args.triggerTestId as string);

  await step('Ref resolves to the trigger button', () => {
    expect(args.ref?.current).toBe(trigger);
    expect(args.ref?.current?.tagName).toBe('BUTTON');
  });

  await step('Ref target receives focus', async () => {
    args.ref?.current?.focus();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
};
