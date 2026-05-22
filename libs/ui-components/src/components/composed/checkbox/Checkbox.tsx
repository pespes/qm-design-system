import React, { useId } from 'react';
import type { CheckboxProps } from './Checkbox.types.js';
import { Checkbox as CheckboxPrimitive } from '@/components/primitives/checkbox/Checkbox.js';
import { Label } from '@/components/primitives/label/Label.js';
import { cn } from '@/utils/utils.js';

function Checkbox({ label, className, classes, ref, ...props }: CheckboxProps) {
  const checkboxId = useId();
  return (
    <div className={cn('flex items-center gap-250', classes?.root)}>
      <CheckboxPrimitive
        id={checkboxId}
        ref={ref}
        className={cn(className, classes?.checkbox)}
        {...props}
      />
      <Label htmlFor={checkboxId} type='emphasis' className={classes?.label}>
        {label}
      </Label>
    </div>
  );
}

export { Checkbox };
