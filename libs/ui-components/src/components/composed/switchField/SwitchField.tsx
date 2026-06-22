import type { FieldWrapperClassMap } from '../field/FieldWrappers.types.js';
import type { SwitchFieldProps } from './SwitchField.types.js';
import { FieldWrapper } from '@/components/composed/field/FieldWrappers.js';
import { Switch } from '@/components/primitives/switch/Switch.js';
import type { SwitchClassMap } from '@/components/primitives/switch/Switch.types.js';
import { cn } from '@/utils/utils.js';

function SwitchField({
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
  reverse,
  ...props
}: SwitchFieldProps) {
  const { switch: switchEl, thumb, ...fieldWrapperClasses } = classes || {};

  const selectClasses = {
    root: switchEl,
    thumb,
  } as SwitchClassMap;

  const wrapperClasses = {
    ...fieldWrapperClasses,
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
      classes={wrapperClasses}
      orientation='horizontal'
      reverse={reverse}
    >
      {(controlProps) => (
        <Switch
          {...props}
          {...controlProps}
          ref={ref}
          className={cn('[grid-area:control]', className)}
          disabled={disabled}
          classes={selectClasses}
        />
      )}
    </FieldWrapper>
  );
}

export { SwitchField };
