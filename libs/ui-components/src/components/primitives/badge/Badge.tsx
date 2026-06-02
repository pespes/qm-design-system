import React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';
import type {
  BaseBadgeProps,
  BadgeProps,
  StatusBadgeProps,
} from './Badge.types.js';
import type { IconSlotProps } from '@/components/_shared/iconSlot.js';
import { cn } from '@/utils/utils.js';

function BaseBadge({
  icon,
  className,
  classes,
  render,
  ...props
}: BaseBadgeProps) {
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
    props: mergeProps<'span'>(
      {
        className: cn(className, classes?.root),
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

const baseBadgeClasses =
  'group/badge inline-flex min-h-500 w-fit shrink-0 align-middle items-center justify-center gap-100 overflow-hidden whitespace-nowrap px-200 py-050 ' +
  'rounded-full border-1 border-transparent type-ui-caption leading-none [&>svg]:pointer-events-none [&>svg]:size-300 [&>svg]:aspect-square';

const badgeVariants = cva(baseBadgeClasses, {
  variants: {
    variant: {
      primary: 'bg-primary-background text-primary-foreground',
      secondary: 'bg-primary-background-subtle text-primary-text',
      brand: 'bg-brand-background text-brand-foreground',
      destructive: 'bg-status-danger-background text-status-danger-foreground',
      outline: 'border-border-default text-foreground-default bg-transparent',
      ghost: 'text-foreground-default bg-transparent',
    },
  },
});

function Badge({ ref, className, variant, ...props }: BadgeProps) {
  return (
    <BaseBadge
      ref={ref}
      {...props}
      className={cn(badgeVariants({ variant }), className)}
    />
  );
}

const statusBadgeVariants = cva(baseBadgeClasses, {
  variants: {
    variant: {
      danger: 'bg-status-danger-background-subtle text-status-danger-text',
      success: 'bg-status-success-background-subtle text-status-success-text',
      system: 'bg-accent-background-subtle text-accent-text',
      warning: 'bg-status-warning-background-subtle text-status-warning-text',
    },
  },
});

function StatusBadge({ ref, className, variant, ...props }: StatusBadgeProps) {
  return (
    <BaseBadge
      ref={ref}
      {...props}
      className={cn(statusBadgeVariants({ variant }), className)}
    />
  );
}

export { Badge, StatusBadge };
