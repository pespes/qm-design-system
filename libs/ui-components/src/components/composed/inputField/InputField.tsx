import type { FieldWrapperClassMap } from '../field/FieldWrappers.types.js';
import type { InputFieldProps } from './InputField.types.js';
import type { InputClassMap } from '@/components/composed/input/Input.types.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import { Input } from '@/components/composed/input/Input.js';
import { cn } from '@/utils/utils.js';

function InputField({
  label: labelString,
  description,
  error,
  invalid,
  required,
  disabled,
  classes,
  testId,
  className,
  id,
  ref,
  ...props
}: InputFieldProps) {
  const { input, icon, ...wrapperClasses } = classes || {};
  const inputClasses = {
    root: input,
    icon,
  } as InputClassMap;

  const wrapperClassMap = {
    ...wrapperClasses,
  } as FieldWrapperClassMap;

  return (
    <FieldWrapper
      label={labelString}
      description={description}
      error={error}
      invalid={!!error || invalid}
      disabled={disabled}
      required={required}
      controlId={id}
      orientation='vertical'
      classes={wrapperClassMap}
    >
      {(controlProps) => (
        <Input
          {...props}
          {...controlProps}
          ref={ref}
          className={cn(className)}
          disabled={disabled}
          classes={inputClasses}
          testId={testId ?? 'input-group-input'}
        />
      )}
    </FieldWrapper>
  );
}

export { InputField };
