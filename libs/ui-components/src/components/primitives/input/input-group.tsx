import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconButton } from '@/components/primitives/icon-button/IconButton.js';
import { Button } from '@/components/primitives/button/Button.js';
import { cn } from '@/utils/utils.js';
import { Input } from '@/components/primitives/input/input.js';

const inputGroupVariants = cva(
  [
    'group/input-group relative flex w-full min-w-0 self-stretch items-center rounded-400 border border-border-default transition-colors',
    'in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0',
    'has-disabled:bg-transparent has-disabled:border-border-subtle [&_input:disabled]:text-state-disabled [&_input:disabled::placeholder]:text-state-disabled',
    'has-[[data-slot=input-group-control]:focus-visible]:outline-2 has-[[data-slot=input-group-control]:focus-visible]:outline-focus-ring has-[[data-slot=input-group-control]:focus-visible]:outline-offset-2 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-border-subtle',
    'has-aria-invalid:border-status-danger-border-strong has-aria-invalid:border-2',
    'has-[>textarea]:h-auto has-[>[data-align=inline-end]]:[&>input]:pr-0 has-[>[data-align=inline-start]]:[&>input]:pl-0',
  ].join(' '),
  {
    variants: {
      size: {
        default: '[&_input]:py-250 [&_input]:px-300 [&_input]:min-h-1000',
        lg: '[&_input]:py-300 [&_input]:px-350 [&_input]:min-h-1200',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function InputGroup({
  className,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      className={cn(inputGroupVariants({ size }), className)}
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
//added aria-hidden true, removed clickable functionality - this hsould only be for adding in icons
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
      data-testid='input-group-addon'
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

type InputGroupButtonExtras = {
  type?: 'button' | 'submit' | 'reset';
  align?: 'inline-start' | 'inline-end';
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
      type={type}
      data-slot='input-group-button'
      data-size={size}
      data-align={align}
      size={size}
      variant={variant}
      className={cn(
        inputGroupButtonVariants({ align }),
        'rounded-400 h-auto min-w-auto text-foreground-subtle p-100',
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
}: React.ComponentProps<'input'>) {
  return (
    <Input
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
