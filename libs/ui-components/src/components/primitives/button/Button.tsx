import React, { type ReactElement } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from '../../../utils/utils.js';
import { Spinner } from '../spinner/Spinner.jsx';
import type { ButtonProps, IconSlotProps } from './Button.types.js';

const ICON_SIZES = {
  sm: 16,
  md: 16,
  lg: 20,
} as const;

const ICON_POSITION = {
  left: 'inline-start',
  right: 'inline-end',
} as const;

const buttonVariants = cva(
  'group/button inline-flex shrink-0 align-middle items-center justify-center cursor-pointer bg-clip-padding whitespace-nowrap focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle disabled:pointer-events-none [&_[data-icon]]:pointer-events-none [&_[data-icon]]:shrink-0',
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
  // To check whether the <Button/> renders a native button, check for the prop, then check if the 'render' prop exists to override the native <button> el.
  // If 'render' does exist, check if it is passed an HTML element and its type to determine if a button is being rendered. Finally, if the 'render' prop returns
  // a function instead, isNativeButton will default to false. If the 'render' prop is passed a function: () => <button/>, then it is up to the consuming dev to
  // to pass 'isNative={true}' to prevent duplicate ARIA properties from being applied, as specified in the docs.
  const isNativeButton =
    nativeButton ??
    (!render || (React.isValidElement(render) && render.type === 'button'));

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
      {...props}
    >
      {icon && icon.position === 'left' && renderIcon(icon.component, 'left')}
      {isLoading ? (
        <>
          <Spinner data-icon='inline-start' className={classes?.icon} />
          <span className={classes?.content}>{loading.title}</span>
        </>
      ) : (
        <span className={classes?.content}>{props.children}</span>
      )}
      {icon && icon.position === 'right' && renderIcon(icon.component, 'right')}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
