import React, { useId } from 'react';
import type { CheckboxProps } from './Checkbox.types.js';
import { Checkbox as CheckboxPrimitive } from '@/components/primitives/checkbox/Checkbox.js';
import { Label } from '@/components/primitives/label/Label.js';
import { cn } from '@/utils/utils.js';

function Checkbox({
  label: labelString,
  className,
  classes,
  ref,
  ...props
}: CheckboxProps) {
  const checkboxId = useId();
  const { root, label, checkbox, icon } = classes || {};

  return (
    <div className={cn('flex items-center gap-250', className, root)}>
      <CheckboxPrimitive
        id={checkboxId}
        ref={ref}
        className={checkbox}
        iconClasses={icon}
        {...props}
      />
      <Label htmlFor={checkboxId} type='emphasis' className={label}>
        {labelString}
      </Label>
    </div>
  );
}

export { Checkbox };
