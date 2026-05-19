import React, { type ReactElement } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import type { ButtonProps } from './Button.types.js';
import { Spinner } from '@/components/primitives/spinner/Spinner.jsx';
import { resolveButtonTag } from '@/components/_shared/renderUtils.js';
import {
  type IconSlotProps,
  ICON_SIZES,
  ICON_POSITION,
} from '@/components/_shared/iconSlot.js';
import { cn } from '@/utils/utils.js';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 align-middle items-center justify-center cursor-pointer bg-clip-padding whitespace-nowrap focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle aria-disabled:pointer-events-none disabled:pointer-events-none [&_[data-icon]]:pointer-events-none [&_[data-icon]]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-background text-primary-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled aria-disabled:bg-state-disabled',
        outline:
          'border-primary-border border-1 text-primary-text hover-overlay-light pressed-overlay-light [--overlay-inset:-1px] disabled:border-state-disabled disabled:text-state-disabled aria-disabled:border-state-disabled aria-disabled:text-state-disabled',
        secondary:
          'bg-primary-background-subtle text-primary-text hover-overlay-light pressed-overlay-light disabled:bg-state-disabled-subtle disabled:text-state-disabled aria-disabled:bg-state-disabled-subtle aria-disabled:text-state-disabled',
        brand:
          'bg-brand-background text-brand-foreground hover-overlay-dark pressed-overlay-dark disabled:bg-state-disabled aria-disabled:bg-state-disabled',
        ghost:
          'text-primary-text hover:bg-muted hover-overlay-light pressed-overlay-light disabled:text-state-disabled aria-disabled:text-state-disabled',
        danger:
          'bg-status-danger-background text-status-danger-foreground hover-overlay-light pressed-overlay-light disabled:bg-state-disabled aria-disabled:bg-state-disabled',
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
  classes,
  variant = 'primary',
  size = 'md',
  rounded,
  loading,
  disabled,
  icon,
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const isLoading = loading?.state === 'loading';
  const isDisabled = disabled || isLoading;

  // Check for if the <Button /> renders a native button based on presence of nativeButton & render props.
  // If render prop is passed a function that returns a button, it is up to the consuming dev to pass nativeButton={true} to
  // prevent duplication of ARIA props
  const isNativeButton = nativeButton ?? resolveButtonTag(render);

  const renderIcon = (
    el: ReactElement<IconSlotProps>,
    position: 'left' | 'right',
  ) => {
    return React.cloneElement(el, {
      size: ICON_SIZES[size],
      'data-icon': ICON_POSITION[position],
      ...(!!classes?.icon && { className: classes.icon }),
    });
  };

  return (
    <ButtonPrimitive
      data-slot='button'
      ref={ref}
      nativeButton={isNativeButton}
      render={render}
      className={cn(
        buttonVariants({ variant, size, rounded }),
        className,
        classes?.root,
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      focusableWhenDisabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            data-icon='inline-start'
            size={ICON_SIZES[size]}
            className={classes?.icon}
          />
          <span className={classes?.content}>{loading.title}</span>
        </>
      ) : (
        <>
          {icon &&
            icon.position === 'left' &&
            renderIcon(icon.component, 'left')}
          <span className={classes?.content}>{props.children}</span>
          {icon &&
            icon.position === 'right' &&
            renderIcon(icon.component, 'right')}
        </>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
