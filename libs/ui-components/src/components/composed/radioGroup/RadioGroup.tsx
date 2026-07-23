import { useId } from 'react';
import type { RadioGroupProps, OptionProps } from './RadioGroup.types.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import type { FieldWrapperClassMap } from '@/components/composed/field/FieldWrappers.types.js';
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupItem as RadioItemPrimitive,
} from '@/components/primitives/radio/radio-group.js';
import { cn } from '@/utils/utils.js';

// https://base-ui.com/react/components/radio#form-integration
// RadioGroup on its own does not handle form validation (data-required / data-invalid), and only serves as a logical
// and accessible container for radio buttons. More robust form integration with validation and legends should use
// the RadioField component.
function RadioGroup({
  options,
  classes,
  className,
  disabled,
  ...props
}: RadioGroupProps) {
  const { root, ...childrenClasses } = classes || {};
  return (
    <RadioGroupPrimitive
      className={cn(root, className)}
      disabled={disabled}
      {...props}
    >
      {options.map((opt) => (
        <RadioGroupItem
          key={opt.value}
          {...opt}
          disabled={disabled || opt.disabled}
          classes={childrenClasses}
        />
      ))}
    </RadioGroupPrimitive>
  );
}

function RadioGroupItem({
  ref,
  label,
  description,
  value,
  disabled,
  invalid,
  required,
  classes,
  ...props
}: OptionProps) {
  const radioId = useId();
  const { radio, ...fieldWrapperClasses } = classes || {};

  const wrapperClasses = {
    ...fieldWrapperClasses,
    root: cn('gap-x-250', fieldWrapperClasses?.option),
    label: cn(
      'group-data-invalid/field:text-status-danger-text type-ui-default',
      disabled && 'text-state-disabled',
      fieldWrapperClasses?.label,
    ),
  } as FieldWrapperClassMap;

  return (
    <FieldWrapper
      label={label}
      description={description}
      invalid={invalid}
      disabled={disabled}
      required={required}
      controlId={radioId}
      orientation='horizontal'
      reverse={true}
      classes={wrapperClasses}
    >
      {(controlProps) => (
        <RadioItemPrimitive
          {...controlProps}
          value={value}
          ref={ref}
          className={cn(radio)}
          disabled={disabled}
          {...props}
        />
      )}
    </FieldWrapper>
  );
}

export { RadioGroup, RadioGroupItem };
