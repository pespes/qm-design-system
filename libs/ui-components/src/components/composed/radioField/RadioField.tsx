import type { RadioFieldProps } from './RadioField.types.js';
import type { RadioItemMap } from '@/components/composed/radioGroup/RadioGroup.types.js';
import { FieldSetWrapper } from '@/components/composed/field/FieldWrappers.js';
import { RadioGroup } from '@/components/composed/radioGroup/RadioGroup.js';
import { cleanErrorMessages } from '@/components/_shared/validationUtils.js';
import { cn } from '@/utils/utils.js';

function RadioField({
  options,
  classes,
  className,
  label,
  description,
  error,
  invalid: invalidProp,
  required,
  disabled,
  ...props
}: RadioFieldProps) {
  const errorContent = cleanErrorMessages(error);
  const isInvalid = invalidProp ?? errorContent.length > 0;

  // Enhance options: pass validation state down to each item
  const enhancedOptions = options.map((opt) => ({
    ...opt,
    invalid: isInvalid,
    disabled: disabled ?? opt.disabled,
  }));

  const {
    option,
    radio,
    radioDescriptionText,
    radioLabel,
    ...fieldSetClasses
  } = classes || {};

  const radioGroupClasses = {
    option,
    radio,
    label: radioLabel,
    descriptionText: radioDescriptionText,
  } as RadioItemMap;

  return (
    <FieldSetWrapper
      label={label}
      description={description}
      error={error}
      invalid={invalidProp}
      required={required}
      disabled={disabled}
      classes={fieldSetClasses}
    >
      {(controlProps) => (
        <RadioGroup
          options={enhancedOptions}
          className={cn(className)}
          classes={radioGroupClasses}
          disabled={disabled}
          {...controlProps}
          {...props}
        />
      )}
    </FieldSetWrapper>
  );
}

export { RadioField };
