import { useId } from 'react';
import type { FieldWrapperClassMap } from '../field/FieldWrappers.types.js';
import type { SelectFieldProps } from './SelectField.types.js';
import type { SelectClassMap } from '@/components/composed/select/Select.types.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import { Select } from '@/components/composed/select/Select.js';
import { labelBaseClassName } from '@/components/primitives/label/Label.js';
import { cn } from '@/utils/utils.js';

function SelectField({
  label: labelString,
  description,
  error,
  invalid,
  required,
  disabled,
  className,
  classes,
  triggerTestId,
  id,
  ref,
  ...props
}: SelectFieldProps) {
  const labelId = useId();

  const {
    root,
    label,
    trigger,
    triggerContent,
    overlay,
    groupLabel,
    item,
    scrollBtn,
    selectItemIcon,
    errorText,
    descriptionText,
  } = classes || {};

  const selectClasses = {
    trigger,
    triggerContent,
    overlay,
    groupLabel,
    item,
    scrollBtn,
    selectItemIcon,
  } as SelectClassMap;

  const wrapperClasses = {
    root,
    label,
    errorText,
    descriptionText,
  } as FieldWrapperClassMap;

  const labelNode = (
    <label
      id={labelId}
      className={cn(
        labelBaseClassName,
        'type-ui-default-emphasis group/field-label peer/field-label',
      )}
    >
      {labelString}
    </label>
  );

  return (
    <FieldWrapper
      label={labelNode}
      labelId={labelId}
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
        // data-testid is already handled in the <Select> component with the triggerTestId
        <Select
          {...props}
          {...controlProps}
          ref={ref}
          className={className}
          error={!!error || !!invalid}
          disabled={disabled}
          classes={selectClasses}
          triggerTestId={triggerTestId ?? 'select-field'}
        />
      )}
    </FieldWrapper>
  );
}

export { SelectField };
