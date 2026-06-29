import { createContext } from 'react';
import type { CheckboxFieldProps } from './CheckboxField.types.js';
import { FieldSetWrapper } from '@/components/composed/field/FieldWrappers.js';
import { CheckboxGroup } from '@/components/primitives/checkboxGroup/CheckboxGroup.js';
import { parseErrorMessages } from '@/components/_shared/validationUtils.js';
import { cn } from '@/utils/utils.js';

const CheckboxFieldContext = createContext<{ invalid?: boolean } | null>(null);

function CheckboxField({
  label,
  description,
  error,
  invalid: invalidProp,
  required,
  disabled,
  children,
  classes,
  className,
  ...props
}: CheckboxFieldProps) {
  const errorContent = parseErrorMessages(error);
  const isInvalid = invalidProp ?? errorContent.length > 0;

  const { checkboxGroup, ...fieldWrapperClasses } = classes || {};

  const wrapperClasses = {
    ...fieldWrapperClasses,
    label: cn(
      'group-data-invalid/field:text-status-danger-text',
      fieldWrapperClasses?.label,
    ),
  };

  return (
    <FieldSetWrapper
      label={label}
      description={description}
      error={error}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      classes={wrapperClasses}
    >
      {(controlProps) => (
        <CheckboxFieldContext.Provider value={{ invalid: isInvalid }}>
          <CheckboxGroup
            {...props}
            className={cn(className, checkboxGroup)}
            disabled={disabled}
            data-testid='test'
            {...controlProps}
          >
            {children}
          </CheckboxGroup>
        </CheckboxFieldContext.Provider>
      )}
    </FieldSetWrapper>
  );
}

export { CheckboxField, CheckboxFieldContext };
