import type { FieldWrapperClassMap } from '../field/FieldWrappers.types.js';
import type { TextAreaClassMap } from '../textarea/TextArea.types.js';
import type { TextAreaFieldProps } from './TextAreaField.types.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import { TextArea } from '@/components/composed/textarea/TextArea.js';

function TextAreaField({
  label: labelString,
  description,
  error,
  invalid,
  required,
  disabled,
  className,
  classes,
  id,
  ref,
  maxLength,
  maxLengthSRFunc,
  ...props
}: TextAreaFieldProps) {
  const {
    root,
    label,
    textarea,
    content,
    counter,
    errorText,
    descriptionText,
  } = classes || {};

  const textareaClasses = {
    root: textarea,
    content,
    counter,
  } as TextAreaClassMap;

  const wrapperClasses = {
    root,
    label,
    errorText,
    descriptionText,
  } as FieldWrapperClassMap;

  const maxLengthProps =
    maxLength && !!maxLengthSRFunc ? { maxLength, maxLengthSRFunc } : {};

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
      classes={wrapperClasses}
    >
      {(controlProps) => (
        <TextArea
          {...props}
          {...controlProps}
          ref={ref}
          className={className}
          disabled={disabled}
          classes={textareaClasses}
          testId={id ?? 'input-group-textarea'}
          {...maxLengthProps}
        />
      )}
    </FieldWrapper>
  );
}

export { TextAreaField };
