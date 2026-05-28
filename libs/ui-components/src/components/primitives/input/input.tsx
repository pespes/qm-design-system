import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/utils.js';

/**
 * Bare input control. Should be rendered inside an `InputGroup`, which styles the border, background,
 * radius, transitions, and focus ring. Using `Input` outside of an `InputGroup` is unsupported.
 */

const inputGroupVariants = cva(
  'w-full min-w-0 bg-transparent outline-none type-ui-default text-foreground-default placeholder:text-foreground-subtle',
  {
    variants: {
      size: {
        default: 'py-250 px-300 min-h-1000',
        lg: 'py-300 px-350 min-h-1200 type-ui-lead',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function Input({
  className,
  size,
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & { size?: 'default' | 'lg' }) {
  return (
    <InputPrimitive
      data-slot='input'
      className={cn(inputGroupVariants({ size }), className)}
      {...props}
    />
  );
}

export { Input };
