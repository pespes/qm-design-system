import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { cn } from '@/utils/utils.js';

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot='radio-group'
      className={cn('group grid w-full gap-200', className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot='radio-group-item'
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-400 shrink-0 rounded-full border border-border-default data-checked:border-brand-background data-checked:bg-brand-background',
        'focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 after:absolute after:-inset-x-250 after:-inset-y-100 focus-visible:ring-2 focus-visible:ring-border-subtle',
        'data-disabled:bg-state-disabled-subtle data-disabled:border-state-disabled data-disabled:data-checked:border-none data-disabled:data-checked:bg-state-disabled',
        'aria-invalid:border-status-danger-text aria-invalid:border-2 aria-invalid:data-checked:bg-status-danger-text aria-invalid:data-checked:border-status-danger-text',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot='radio-group-indicator'
        className='flex size-4 items-center justify-center'
      >
        <span className='absolute top-1/2 left-1/2 size-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground' />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
