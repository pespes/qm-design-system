import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/utils/utils.js';

/**
 * Bare input control. Should be rendered inside an `InputGroup`, which styles
 * the border, background, radius, transitions, and focus ring. Using `Input`
 * outside of an `InputGroup` is unsupported.
 */
function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      data-slot='input'
      className={cn(
        'w-full min-w-0 bg-transparent outline-none type-ui-default text-foreground-default placeholder:text-foreground-subtle',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
