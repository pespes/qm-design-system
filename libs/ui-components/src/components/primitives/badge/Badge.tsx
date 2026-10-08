import React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';
import type { BadgeProps } from './Badge.types.js';
import type { IconSlotProps } from '@/components/_shared/iconSlot.js';
import { cn } from '@/utils/utils.js';

const badgeVariants = cva(
  'group/badge inline-flex min-h-500 w-fit shrink-0 align-middle items-center justify-center gap-100 overflow-hidden whitespace-nowrap px-200 py-050 ' +
    'rounded-full border-1 border-transparent type-ui-caption leading-none [&>svg]:pointer-events-none [&>svg]:size-300 [&>svg]:aspect-square',
  {
    variants: {
      variant: {
        base: 'bg-base-background text-base-foreground',
        secondary: 'bg-base-background-subtle text-base-text',
        brand: 'bg-brand-background text-brand-foreground',
        destructive: 'bg-danger-background text-danger-foreground',
        outline: 'border-border-default text-foreground-default bg-transparent',
        ghost: 'text-foreground-default bg-transparent',
        danger: 'bg-danger-background-subtle text-danger-text',
        success: 'bg-success-background-subtle text-success-text',
        system: 'bg-accent-background-subtle text-accent-text',
        warning: 'bg-warning-background-subtle text-warning-text',
      },
    },
  },
);

function Badge({
  ref,
  variant,
  icon,
  className,
  classes,
  render,
  ...props
}: BadgeProps) {
  const renderIcon = (el: React.ReactElement<IconSlotProps>) => {
    return React.cloneElement(el, {
      size: 12,
      'aria-hidden': true,
      'data-slot': 'icon',
      className: cn('flex-shrink-0', classes?.icon),
    });
  };

  const renderChildren = () => (
    <>
      {icon && icon.position === 'left' && renderIcon(icon.component)}
      <span className={classes?.content}>{props.children}</span>
      {icon && icon.position === 'right' && renderIcon(icon.component)}
    </>
  );

  return useRender({
    defaultTagName: 'span',
    ref,
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className, classes?.root),
      },
      props,
      { children: renderChildren() },
    ),
    render,
    state: {
      slot: 'badge',
    },
  });
}

export { Badge };
