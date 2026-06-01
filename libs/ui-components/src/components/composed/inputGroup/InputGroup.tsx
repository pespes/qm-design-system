import { useId } from 'react';
import type { InputGroupProps } from './InputGroup.types.js';
import type { InputClassMap } from '@/components/composed/input/Input.types.js';
import { Label } from '@/components/primitives/label/Label.js';
import { Input } from '@/components/composed/input/Input.js';

import { cn } from '@/utils/utils.js';

function InputGroup({
  label: labelString,
  className,
  classes,
  testId,
  id,
  ref,
  ...props
}: InputGroupProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { root, label, input, icon } = classes || {};
  const inputClasses = {
    root: input,
    icon,
  } as InputClassMap;

  return (
    <div className={cn('flex flex-col items-start gap-100', className, root)}>
      <Label htmlFor={inputId} type='emphasis' className={label}>
        {labelString}
      </Label>
      <Input
        {...props}
        id={inputId}
        ref={ref}
        classes={inputClasses}
        testId={testId ?? 'input-group-input'}
      />
    </div>
  );
}

export { InputGroup };
