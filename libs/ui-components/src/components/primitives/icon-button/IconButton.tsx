import React, { type ReactElement, useId } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/utils.js';
import { resolveButtonTag } from '../../_shared/renderUtils.js';
import { Spinner } from '../spinner/Spinner.jsx';
import { type IconSlotProps, ICON_SIZES } from '../../_shared/iconSlot.js';
import type { IconButtonProps } from './IconButton.types.js';

const buttonVariants = cva(
  'aspect-square group/button inline-flex shrink-0 align-middle items-center cursor-pointer rounded-full justify-center bg-clip-padding whitespace-nowrap focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-background text-primary-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled',
        outline:
          'border-primary-border border-1 text-primary-text hover-overlay-light pressed-overlay-light [--overlay-inset:-1px] disabled:border-state-disabled disabled:text-state-disabled',
        secondary:
          'bg-primary-background-subtle text-primary-text hover-overlay-light pressed-overlay-light disabled:bg-state-disabled-subtle disabled:text-state-disabled',
        brand:
          'bg-brand-background text-brand-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled',
        ghost:
          'text-primary-text hover:bg-muted hover-overlay-light pressed-overlay-light disabled:text-state-disabled',
        danger:
          'bg-status-danger-background text-status-danger-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled-subtle disabled:text-state-disabled',
      },
      size: {
        md: 'h-1000 min-w-1000 p-300',
        sm: 'h-800 min-w-800 p-200',
        lg: 'h-1200 min-w-1200 p-350',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

function IconButton({
  children,
  className,
  classes,
  variant = 'primary',
  size = 'md',
  disabled,
  label,
  loading,
  nativeButton,
  render,
  ...props
}: IconButtonProps) {
  const isLoading = loading?.state === 'loading';
  const isDisabled = disabled || isLoading;
  const labelId = useId();

  // Check for if the <Button /> renders a native button based on presence of nativeButton & render props.
  // If render prop is passed a function that returns a button, it is up to the consuming dev to pass nativeButton={true} to
  // prevent duplication of ARIA props
  const isNativeButton = nativeButton ?? resolveButtonTag(render);

  const renderIcon = (el: ReactElement<IconSlotProps>) => {
    return React.cloneElement(el, {
      size: ICON_SIZES[size],
      ...(!!classes?.icon && { className: classes.icon }),
    });
  };

  return (
    <ButtonPrimitive
      data-slot='button'
      aria-labelledby={labelId}
      nativeButton={isNativeButton}
      render={render}
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant, size }),
        className,
        classes?.root,
      )}
      {...props}
    >
      <span id={labelId} className='sr-only'>
        {isLoading ? loading.title : label}
      </span>
      {isLoading ? (
        <Spinner
          className={classes?.icon}
          size={ICON_SIZES[size]}
          aria-hidden={true}
        />
      ) : (
        renderIcon(children)
      )}
    </ButtonPrimitive>
  );
}
export { IconButton };
