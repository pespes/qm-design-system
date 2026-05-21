import React, { useId } from 'react';
import type { RadioGroupProps, OptionProps } from './RadioGroup.types.js';
import { Label } from '@/components/primitives/label/Label.js';
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupItem as RadioItemPrimitive,
} from '@/components/primitives/radio/radio-group.js';
import { cn } from '@/utils/utils.js';

// https://base-ui.com/react/components/radio#form-integration
// According to BaseUI, the RadioGroup component is only meant to be integrated into a form in conjunction with
// the Field and Fieldset elements. RadioGroup on its own does not handle any data-required or data-invalid
// attributes, only data-disabled to disable the group as a whole.
// A composed RadioFieldSet component will be used for form integration.
function RadioGroup({
  options,
  orientation = 'vertical',
  classes,
  className,
  ...props
}: RadioGroupProps) {
  const { root, ...childrenClasses } = classes || {};
  const layout =
    orientation === 'horizontal'
      ? 'flex flex-row flex-wrap gap-300 w-auto'
      : '';
  return (
    <RadioGroupPrimitive className={cn(root, layout, className)} {...props}>
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
    <div className={cn('flex items-center gap-200', classes?.option)}>
      <RadioItemPrimitive
        id={radioId}
        value={value}
        disabled={disabled}
        ref={ref}
        className={classes?.radio}
        {...props}
      />
      <Label htmlFor={radioId} type='emphasis' className={classes?.label}>
        {label}
      </Label>
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
