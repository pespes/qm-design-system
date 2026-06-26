import { useId } from 'react';
import type { CheckboxProps } from './Checkbox.types.js';
import { Checkbox as CheckboxPrimitive } from '@/components/primitives/checkbox/Checkbox.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import type { FieldWrapperClassMap } from '@/components/composed/field/FieldWrappers.types.js';
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
  const { checkbox, icon, root, ...fieldWrapperClasses } = classes || {};

  const wrapperClasses = {
    root: cn('gap-x-250', className, root),
    ...fieldWrapperClasses,
  } as FieldWrapperClassMap;

  return (
    <FieldWrapper
      label={labelString}
      description={description}
      invalid={invalid}
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
