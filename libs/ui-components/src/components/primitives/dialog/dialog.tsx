import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { cn } from '@/utils/utils.js';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot='dialog-overlay'
      className={cn(
        'fixed inset-0 isolate z-50 surface-overlay-backdrop duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex flex-col overflow-hidden min-w-[300px] max-w-[960px] max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 gap-0 rounded-300 bg-surface-default p-0 shadow-400',
          'duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <header
      data-slot='dialog-header'
      className={cn(
        // 3-col grid: sides sized to the sm IconButton, middle fills remaining space.
        'shrink-0 grid grid-cols-[var(--spacing-1000)_1fr_var(--spacing-1000)] items-center gap-200 p-400 text-foreground-default',
        '[&_[data-testid=dialog-header-action-btn]]:col-start-1',
        '[&_[data-slot=dialog-title]]:col-start-2 [&_[data-slot=dialog-title]]:text-center',
        '[&_[data-testid=dialog-close-btn]]:col-start-3 [&_[data-testid=dialog-close-btn]]:justify-center',
        className,
      )}
      {...props}
    />
  );
}

//removed showCloseBtn which Shadcn uses to implement a non-customizable button
function DialogFooter({
  className,
  fullWidth = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <footer
      data-slot='dialog-footer'
      className={cn(
        'flex shrink-0 gap-300 p-600',
        fullWidth ? '[&>*]:flex-1' : 'justify-end',
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('type-header-h3', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
