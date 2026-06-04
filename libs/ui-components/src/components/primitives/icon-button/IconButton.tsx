import React, { type ReactElement } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import type { IconButtonProps } from './IconButton.types.js';
import { cn } from '@/utils/utils.js';
import { resolveButtonTag } from '@/components/_shared/renderUtils.js';
import { Spinner } from '@/components/primitives/spinner/Spinner.jsx';
import {
  type IconSlotProps,
  ICON_SIZES,
} from '@/components/_shared/iconSlot.js';

const buttonVariants = cva(
  'aspect-square group/button inline-flex shrink-0 align-middle items-center cursor-pointer rounded-full justify-center bg-clip-padding whitespace-nowrap focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        base: 'bg-base-background text-base-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled aria-disabled:bg-state-disabled',
        outline:
          'border-base-border border-1 text-base-text hover-overlay-light pressed-overlay-light [--overlay-inset:-1px] disabled:border-state-disabled disabled:text-state-disabled aria-disabled:border-state-disabled aria-disabled:text-state-disabled',
        secondary:
          'bg-base-background-subtle text-base-text hover-overlay-light pressed-overlay-light disabled:bg-state-disabled-subtle disabled:text-state-disabled aria-disabled:bg-state-disabled-subtle aria-disabled:text-state-disabled',
        brand:
          'bg-brand-background text-brand-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled aria-disabled:bg-state-disabled',
        ghost:
          'text-base-text hover:bg-muted hover-overlay-light pressed-overlay-light disabled:text-state-disabled aria-disabled:text-state-disabled',
        danger:
          'bg-status-danger-background text-status-danger-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled-subtle disabled:text-state-disabled aria-disabled:bg-state-disabled-subtle aria-disabled:text-state-disabled',
      },
      size: {
        md: 'h-1000 min-w-1000 p-300',
        sm: 'h-800 min-w-800 p-200',
        lg: 'h-1200 min-w-1200 p-350',
      },
    },
    defaultVariants: {
      variant: 'base',
      size: 'md',
    },
  },
);

function IconButton({
  children,
  className,
  classes,
  variant = 'base',
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
      aria-label={label}
      aria-busy={isLoading}
      nativeButton={isNativeButton}
      render={render}
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant, size }),
        className,
        classes?.root,
      )}
      {...props}
      focusableWhenDisabled={isLoading}
    >
      <span role='status' className='sr-only'>
        {isLoading ? loading.title : ''}
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
