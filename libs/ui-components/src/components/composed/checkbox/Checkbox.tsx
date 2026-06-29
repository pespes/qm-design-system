import { useId, useContext } from 'react';
import type { CheckboxProps } from './Checkbox.types.js';
import { Checkbox as CheckboxPrimitive } from '@/components/primitives/checkbox/Checkbox.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import type { FieldWrapperClassMap } from '@/components/composed/field/FieldWrappers.types.js';
import { CheckboxFieldContext } from '@/components/composed/checkboxField/CheckboxField.js';
import { cn } from '@/utils/utils.js';

function Checkbox({
  label: labelString,
  description,
  disabled,
  required,
  invalid,
  className,
  classes,
  ref,
  ...props
}: CheckboxProps) {
  const checkboxId = useId();
  const fieldContext = useContext(CheckboxFieldContext);
  const { checkbox, icon, root, label, descriptionText } = classes || {};

  const isInvalid = invalid ?? fieldContext?.invalid;

  const wrapperClasses = {
    root: cn('gap-x-250', className, root),
    label: cn('group-data-invalid/field:text-status-danger-text', label),
    descriptionText,
  } as FieldWrapperClassMap;

  return (
    <FieldWrapper
      label={labelString}
      description={description}
      invalid={isInvalid}
      disabled={disabled}
      required={required}
      controlId={checkboxId}
      orientation='horizontal'
      classes={wrapperClasses}
      reverse={true}
    >
      {(controlProps) => (
        <CheckboxPrimitive
          {...controlProps}
          id={checkboxId}
          ref={ref}
          className={checkbox}
          iconClasses={icon}
          disabled={disabled}
          {...props}
        />
      )}
    </FieldWrapper>
  );
}

export { Checkbox };
