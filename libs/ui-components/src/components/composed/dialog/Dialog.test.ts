import type { RefObject } from 'react';
import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import type { DialogProps } from './Dialog.types.js';

type DialogContext = StoryContext<DialogProps>;

// --- Default Dialog Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: DialogContext) => {
  const canvas = within(canvasElement);
  const triggerBtn = canvas.getByRole('button');
  await userEvent.click(triggerBtn);
  const dialog = screen.getByRole('dialog');

  await step(
    'Render an element with role=dialog and closeBtn by default',
    async () => {
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/This is a basic Dialog/)).toBeInTheDocument();
      const closeBtn = within(dialog).getByRole('button');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAccessibleName('close dialog');
    },
  );

  await step('passes ref to the overlay', async () => {
    const ref = args.ref as RefObject<HTMLDivElement>;
    const overlay = ref.current;
    expect(overlay).toHaveAttribute('role', 'dialog');
  });

  await step(
    'Header close btn closes the dialog and calls onOpenChange',
    async () => {
      const closeBtn = within(dialog).getByRole('button', {
        name: 'close dialog',
      });
      await userEvent.click(closeBtn);
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
      expect(args.onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'close-press' }),
      );
    },
  );

  await step('Hitting "ESC" key closes the dialog', async () => {
    await userEvent.click(triggerBtn);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
  });

  await step('Clicking outside of dialog closes it', async () => {
    await userEvent.click(triggerBtn);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    await userEvent.click(document.body);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' }),
    );
  });
};

// --- IntegratedTrigger Tests ---
export const integratedTriggerTests = async ({
  args,
  canvasElement,
  step,
}: DialogContext) => {
  const canvas = within(canvasElement);
  const triggerBtn = canvas.getByRole('button');
  await step(
    'TriggerBtn prop opens the dialog and fires onOpenChange(true)',
    async () => {
      await userEvent.click(triggerBtn);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(args.onOpenChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ reason: 'trigger-press' }),
      );
    },
  );

  await step(
    'Primary footer button closes the dialog and fires onOpenChange(false)',
    async () => {
      const dialog = screen.getByRole('dialog');
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Close' }),
      );
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(args.onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'close-press' }),
      );
    },
  );
};

//  --- Footer Buttons Tests ---
export const footerBtnTests = async ({
  args,
  canvasElement,
  step,
}: DialogContext) => {
  const canvas = within(canvasElement);
  const triggerBtn = canvas.getByRole('button');
  await userEvent.click(triggerBtn);

  await step(
    "Clicking secondaryFooterBtn with closeDialog=true also calls button's on click",
    async () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      const cancelBtn = within(dialog).getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelBtn);
      expect(args.onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: 'close-press' }),
      );
      const secondaryOnClick = (
        args.secondaryFooterBtn?.component.props as {
          onClick?: (...args: unknown[]) => void;
        }
      )?.onClick;
      expect(secondaryOnClick).toHaveBeenCalledTimes(1);
    },
  );

  await step(
    "Clicking primaryFooterBtn with closeDialog=false calls button's on click",
    async () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      const submitBtn = within(dialog).getByRole('button', { name: /submit/i });
      await userEvent.click(submitBtn);
      const primaryBtnClick = (
        args.primaryFooterBtn?.component.props as {
          onClick?: (...args: unknown[]) => void;
        }
      )?.onClick;
      expect(primaryBtnClick).toHaveBeenCalledTimes(1);
    },
  );
};

// --- headerActionBtn Tests ---
export const headerActionTests = async ({
  args,
  canvasElement,
  step,
}: DialogContext) => {
  const canvas = within(canvasElement);
  const triggerBtn = canvas.getByRole('button');
  await userEvent.click(triggerBtn);

  await step(
    'renders an IconButton with accessible label when headerActionBtn is specified',
    async () => {
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      await userEvent.click(continueBtn);
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /finish/i }),
        ).toBeInTheDocument();
      });
      const headerBtn = screen.getByRole('button', {
        name: /return to prev step/i,
      });
      expect(headerBtn).toBeInTheDocument();
      expect(headerBtn).toHaveAccessibleName(/return to prev step/i);
    },
  );

  await step('fires passed onClick event to iconButton', async () => {
    const headerBtn = screen.getByRole('button', {
      name: /return to prev step/i,
    });
    expect(args.headerActionBtn?.onClick).not.toHaveBeenCalled();
    await userEvent.click(headerBtn);
    expect(args.headerActionBtn?.onClick).toHaveBeenCalled();
  });
  const closeBtn = screen.getByRole('button', { name: /close dialog/i });
  await userEvent.click(closeBtn);
};

// --- LifecycleCallback (onOpenChangeComplete) Tests ---
export const lifecycleCallbackTests = async ({
  args,
  canvasElement,
  step,
}: DialogContext) => {
  const canvas = within(canvasElement);
  const triggerBtn = canvas.getByRole('button');
  await userEvent.click(triggerBtn);

  await step(
    'onOpenChangeComplete fires with false after dialog closes',
    async () => {
      const closeBtn = within(screen.getByRole('dialog')).getByRole('button', {
        name: 'close dialog',
      });
      await userEvent.click(closeBtn);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(args.onOpenChangeComplete).toHaveBeenCalledWith(false),
      );
    },
  );

  await step(
    'disablePointerDismissal prevents outside clicks from closing dialog',
    async () => {
      await userEvent.click(triggerBtn);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      await userEvent.click(document.body);
      expect(dialog).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
    },
  );
};
