import React, { type ReactElement } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
// import { cva, type VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/utils.js';
import { Spinner } from '../spinner/Spinner.jsx';
import type { ButtonProps } from './Button.types.js';

const ICON_SIZES = {
  sm: '16',
  md: '16',
  lg: '20',
} as const;

const buttonVariants = cva(
  // "group/button inline-flex shrink-0 items-center justify-center rounded-lg bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "group/button inline-flex shrink-0 align-middle items-center justify-center bg-clip-padding whitespace-nowrap focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          'bg-status-danger-background text-status-danger-foreground hover-overlay-light pressed-overlay-light disabled:bg-state-disabled-subtle disabled:text-state-disabled',
      },
      size: {
        md: 'type-ui-default h-1000 gap-150 px-350 py-250',
        sm: 'type-ui-default h-800 gap-150 px-300 py-150',
        lg: 'type-ui-lead h-1200 gap-150 px-350',
      },
      rounded: {
        default: 'rounded-400',
        full: 'rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  },
);

function Button({
  ref,
  className,
  variant = 'primary',
  size = 'md',
  rounded,
  fullWidth,
  loading,
  disabled,
  icon,
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const isLoading = loading?.state === 'loading';
  const isDisabled = disabled || isLoading;
  const isNativeButton =
    nativeButton ??
    (!render || (React.isValidElement(render) && render.type === 'button'));

  const renderIcon = (el: ReactElement) => {
    console.log(el);
    return React.cloneElement(el, {
      size: ICON_SIZES[size],
    });
  };

  return (
    <ButtonPrimitive
      data-slot='button'
      ref={ref}
      nativeButton={isNativeButton}
      render={render}
      className={cn(
        buttonVariants({ variant, size, fullWidth, rounded, className }),
      )}
      disabled={isDisabled}
      {...props}
    >
      {icon && icon.position === 'left' && renderIcon(icon.component)}
      {isLoading ? (
        <>
          <Spinner data-icon='inline-start' />
          {loading.title}
        </>
      ) : (
        props.children
      )}
      {icon && icon.position === 'right' && renderIcon(icon.component)}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
