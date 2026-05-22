import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { CheckIcon } from 'lucide-react';
import { cn } from '@/utils/utils.js';

function Checkbox({
  className,
  iconClasses,
  ...props
}: CheckboxPrimitive.Root.Props & { iconClasses?: string | undefined }) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer relative flex size-400 shrink-0 aspect-square items-center justify-center rounded-200 border-1 border-border-default transition-colors after:absolute after:-inset-x-300 after:-inset-y-200',
        'focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-border-subtle',
        'data-checked:border-brand-background data-checked:bg-brand-background data-checked:text-brand-foreground',
        'data-disabled:border-state-disabled data-disabled:bg-state-disabled-subtle data-disabled:data-checked:bg-state-disabled data-disabled:data-checked:border-none',
        'group-has-data-disabled/field:border-state-disabled group-has-data-disabled/field:bg-state-disabled-subtle group-has-data-disabled/field:data-checked:bg-state-disabled group-has-data-disabled/field:data-checked:border-none',
        'aria-invalid:border-2 aria-invalid:border-status-danger-border-strong aria-invalid:aria-checked:bg-status-danger-background aria-invalid:aria-checked:border-status-danger-background',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center transition-none [&>svg]:size-350'
      >
        <CheckIcon className={cn('text-brand-foreground', iconClasses)} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
