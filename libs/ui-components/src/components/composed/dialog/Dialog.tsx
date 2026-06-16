import type { ReactElement } from 'react';
import { XIcon } from 'lucide-react';
import type { DialogProps } from './Dialog.types.js';
import { cn } from '@/utils/utils.js';
import { IconButton } from '@/components/primitives/icon-button/IconButton.js';
import { Separator } from '@/components/primitives/separator/Separator.js';
import {
  Dialog as DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogBody,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/primitives/dialog/dialog.js';

function Dialog({
  ref,
  children,
  title,
  showCloseBtn = true,
  headerActionBtn,
  primaryFooterBtn,
  secondaryFooterBtn,
  footerFullWidth = false,
  open,
  onOpenChange,
  onOpenChangeComplete,
  disablePointerDismissal = false,
  initialFocus,
  finalFocus,
  triggerBtn,
  classes,
  className,
  ...props
}: DialogProps) {
  const hasHeader = Boolean(title || headerActionBtn || showCloseBtn);
  const hasFooter = Boolean(primaryFooterBtn || secondaryFooterBtn);

  // A footer button only dismisses when explicitly opted in; its own onClick (if any)
  // still fires, since Base UI's Close merges handlers onto the rendered element.
  const renderFooterBtn = (props: {
    component: ReactElement;
    closesDialog: boolean;
  }) => {
    if (!props.component) return null;
    return props.closesDialog ? (
      <DialogClose render={props.component} />
    ) : (
      props.component
    );
  };
  return (
    <DialogRoot
      open={open}
      disablePointerDismissal={disablePointerDismissal}
      onOpenChange={(nextOpen, eventDetails) => {
        onOpenChange?.(nextOpen, eventDetails);
        // if (!nextOpen) closeAction?.();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      {...props}
    >
      {triggerBtn ? <DialogTrigger render={triggerBtn} /> : null}

      <DialogContent
        ref={ref}
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        className={cn(className, classes?.overlay)}
      >
        {hasHeader && (
          <DialogHeader className={classes?.header}>
            {headerActionBtn && (
              <IconButton
                variant='ghost'
                size='lg'
                label={headerActionBtn.label}
                onClick={headerActionBtn.onClick}
                className={cn(
                  'h-1000 min-w-1000 p-200',
                  classes?.headerActionBtn,
                )}
                data-testid='dialog-header-action-btn'
              >
                {headerActionBtn.icon}
              </IconButton>
            )}

            {title && (
              <DialogTitle className={classes?.title}>{title}</DialogTitle>
            )}

            {showCloseBtn && (
              <DialogClose
                render={
                  <IconButton
                    variant='ghost'
                    size='lg'
                    label='close dialog'
                    data-testid='dialog-close-btn'
                    className={cn('h-1000 min-w-1000 p-200', classes?.closeBtn)}
                  >
                    <XIcon />
                  </IconButton>
                }
              />
            )}
          </DialogHeader>
        )}

        <DialogBody hasHeader={hasHeader} className={classes?.body}>
          {children}
        </DialogBody>

        {hasFooter && (
          <>
            <Separator />
            <DialogFooter
              fullWidth={footerFullWidth}
              className={classes?.footer}
            >
              {secondaryFooterBtn && renderFooterBtn(secondaryFooterBtn)}
              {primaryFooterBtn && renderFooterBtn(primaryFooterBtn)}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

export { Dialog };
