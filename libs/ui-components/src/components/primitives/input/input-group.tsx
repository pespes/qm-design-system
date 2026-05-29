import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconButton } from '@/components/primitives/icon-button/IconButton.js';
import { Button } from '@/components/primitives/button/Button.js';
import { cn } from '@/utils/utils.js';
import { Input } from '@/components/primitives/input/input.js';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      className={cn(
        'group/input-group relative flex w-full min-w-0 self-stretch items-center rounded-400 border border-border-default transition-colors',
        'in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0',
        'has-disabled:bg-transparent has-disabled:border-border-subtle [&_input:disabled]:text-state-disabled [&_input:disabled::placeholder]:text-state-disabled',
        'has-[[data-slot=input-group-control]:focus-visible]:outline-2 has-[[data-slot=input-group-control]:focus-visible]:outline-focus-ring has-[[data-slot=input-group-control]:focus-visible]:outline-offset-2 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-border-subtle',
        'has-aria-invalid:border-status-danger-border-strong has-aria-invalid:border-2',
        'has-[>textarea]:h-auto has-[>[data-align=inline-end]]:[&>input]:pr-0 has-[>[data-align=inline-start]]:[&>input]:pl-0',
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  'flex h-auto items-center justify-center gap-200 py-150 type-ui-default text-foreground-subtle select-none group-has-disabled/input-group:text-state-disabled [&>kbd]:rounded-400',
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-300 pr-200 has-[>kbd]:ml-[-0.15rem]',
        'inline-end': 'order-last pr-300 pl-200 has-[>kbd]:mr-[-0.15rem]',
      },
    },
    defaultVariants: {
      align: 'inline-end',
    },
  },
);

/**
 * Removed the click functionality & added aria-hidden=true here. Agreed upon with Design, this should only be for adding
 * icons into the InputGroup. If there is a need to add text, use InputGroupText, and if there is a need for a button,
 * use InputGroupButton / InputGroupIconButton
 */
function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      aria-hidden={true}
      data-slot='input-group-addon'
      data-align={align}
      data-testid={`input-group-addon-${align}`}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

type InputGroupButtonExtras = {
  type?: 'button' | 'submit' | 'reset';
  align?: 'inline-start' | 'inline-end';
  'data-testid'?: string | undefined;
};

const inputGroupButtonVariants = cva('flex items-center gap-200 mx-100', {
  variants: {
    align: {
      'inline-start': 'order-first ml-200',
      'inline-end': 'order-last mr-200',
    },
  },
});

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'lg',
  align,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'type'> & InputGroupButtonExtras) {
  return (
    <Button
      data-testid='input-group-button'
      type={type}
      data-slot='input-group-button'
      data-size={size}
      data-align={align}
      size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ align }), className)}
      {...props}
    />
  );
}

/**
 * This component was added in addition to IconGroupButton. It contains the same functionality except for the addition of
 * an aria-label and slightly different styling overrides. Users needing a nested <Button/> can use InputGroupButton.
 */
function InputGroupIconButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'lg',
  align,
  ...props
}: Omit<React.ComponentProps<typeof IconButton>, 'type'> &
  InputGroupButtonExtras) {
  return (
    <IconButton
      data-testid='input-group-icon-button'
      type={type}
      data-slot='input-group-button'
      data-size={size}
      data-align={align}
      size={size}
      variant={variant}
      className={cn(
        inputGroupButtonVariants({ align }),
        'rounded-200 h-auto min-w-auto text-foreground-subtle p-100',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-200 type-ui-default [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-400",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & {
  size?: 'default' | 'lg';
}) {
  return (
    <Input
      data-testid='input-group-input'
      data-slot='input-group-control'
      className={cn('flex-1', className)}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupIconButton,
  InputGroupText,
  InputGroupInput,
};
