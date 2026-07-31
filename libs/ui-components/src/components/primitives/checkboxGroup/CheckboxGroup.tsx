import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import type { CheckboxGroupProps } from './CheckboxGroup.types.js';
import { cn } from '@/utils/utils.js';

function CheckboxGroup({ className, classes, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      className={cn('flex flex-col gap-100 mt-100', classes?.root, className)}
      data-testid='checkbox-group'
      {...props}
    />
  );
}

export { CheckboxGroup };
