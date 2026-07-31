import * as React from 'react';
import { cn } from '@/utils/utils.js';

/**
 * Bare textarea control. Should be rendered inside an `InputGroup`, which styles the border, background,
 * radius, transitions, and focus ring. Using `Textarea` outside of an `InputGroup` is unsupported.
 */
function Textarea({
  className,
  rows,
  ...props
}: React.ComponentProps<'textarea'>) {
  const isResizeDisabled = rows && rows > 0;
  return (
    <textarea
      data-slot='textarea'
      data-testid='input-group-textarea'
      className={cn(
        'w-full bg-transparent outline-none type-body-default text-foreground-default placeholder:text-foreground-subtle px-300 py-250',
        isResizeDisabled ? '' : 'field-sizing-content',
        className,
      )}
      rows={rows}
      {...props}
    />
  );
}

export { Textarea };
