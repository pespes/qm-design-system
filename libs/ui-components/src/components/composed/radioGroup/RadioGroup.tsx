import React, { useId } from 'react';
import type { RadioGroupProps, OptionProps } from './RadioGroup.types.js';
import { Label } from '@/components/primitives/label/Label.js';
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupItem as RadioItemPrimitive,
} from '@/components/primitives/radio/radio-group.js';
import { cn } from '@/utils/utils.js';

// https://base-ui.com/react/components/radio#form-integration
// RadioGroup on its own does not handle form validation (data-required / data-invalid), and only serves as a logical
// and accessible container for radio buttons. More robust form integration with validation and legends should use
// the RadioFieldSet component.
function RadioGroup({
  options,
  classes,
  className,
  ...props
}: RadioGroupProps) {
  const { root, ...childrenClasses } = classes || {};
  return (
    <RadioGroupPrimitive className={cn(root, className)} {...props}>
      {options.map((opt) => (
        <RadioGroupItem key={opt.value} {...opt} classes={childrenClasses} />
      ))}
    </RadioGroupPrimitive>
  );
}

function RadioGroupItem({
  ref,
  label,
  value,
  disabled,
  classes,
  ...props
}: OptionProps) {
  const radioId = useId();
  return (
    <div className={cn('flex items-center gap-250', classes?.option)}>
      <RadioItemPrimitive
        id={radioId}
        value={value}
        disabled={disabled}
        ref={ref}
        className={classes?.radio}
        {...props}
      />
      <Label
        htmlFor={radioId}
        type='emphasis'
        className={cn('cursor-pointer', classes?.label)}
      >
        {label}
      </Label>
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
