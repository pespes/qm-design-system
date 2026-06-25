import { useId, isValidElement } from 'react';

import type {
  ControlRenderProps,
  FieldWrapperProps,
  FieldOrientationProps,
} from './FieldWrappers.types.js';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldContent,
} from '@/components/primitives/field/field.js';

function FieldWrapper({
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  controlId,
  labelId: externalLabelId,
  classes,
  reverse,
  orientation = 'vertical',
  children,
}: FieldWrapperProps) {
  const generatedId = useId();
  const generatedLabelId = useId();
  const descId = useId();
  const errorId = useId();

  const childId = controlId ?? generatedId;
  const labelId = externalLabelId ?? generatedLabelId;

  //Shadcn allows for an Array<{message : string}> to be passed in addition to ReactNode
  const firstError = Array.isArray(error) ? error[0] : error;
  const errorContent =
    typeof firstError === 'object' ? firstError?.message : firstError;
  const isInvalid = invalid ?? !!errorContent;

  // Only include ids of descriptive / error text rendered (Description read before Error text)
  const describedBy =
    [description ? descId : undefined, errorContent ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const labelIsElement = isValidElement(label);
  const renderedLabel = labelIsElement ? (
    label
  ) : (
    <FieldLabel htmlFor={childId} type='emphasis' className={classes?.label}>
      {label}
      {required && (
        <span aria-hidden='true' className='-ml-100 text-status-danger-text'>
          *
        </span>
      )}
    </FieldLabel>
  );

  const controlProps: ControlRenderProps = {
    id: childId,
    'aria-invalid': isInvalid ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required ? true : undefined,
    'aria-labelledby': labelIsElement ? labelId : undefined, // without the htmlFor prop from Label, use aria-labelledby for label association instead
  };

  const { root, ...orientationWrapperClasses } = classes || {};

  const layoutProps: FieldOrientationProps = {
    label: renderedLabel,
    description,
    descId,
    error,
    errorId,
    classes: orientationWrapperClasses,
    controlProps,
    children,
  };

  return (
    <Field
      orientation={orientation}
      reverse={reverse}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
      className={root}
    >
      {orientation === 'horizontal' ? (
        <HorizontalFieldWrapper {...layoutProps} />
      ) : (
        <VerticalFieldWrapper {...layoutProps} />
      )}
    </Field>
  );
}

function VerticalFieldWrapper({
  label,
  description,
  descId,
  error,
  errorId,
  classes,
  controlProps,
  children,
}: FieldOrientationProps) {
  return (
    <>
      <div>
        {label}
        {description && (
          <FieldDescription id={descId} className={classes?.descriptionText}>
            {description}
          </FieldDescription>
        )}
      </div>
      {children(controlProps)}
      {error && (
        <FieldError id={errorId} className={classes?.errorText} error={error} />
      )}
    </>
  );
}

function HorizontalFieldWrapper({
  label,
  description,
  descId,
  error,
  errorId,
  classes,
  controlProps,
  children,
}: FieldOrientationProps) {
  return (
    <>
      <FieldContent>
        {label}
        {description && (
          <FieldDescription id={descId} className={classes?.descriptionText}>
            {description}
          </FieldDescription>
        )}
      </FieldContent>
      {children(controlProps)}
      {error && (
        <FieldError id={errorId} className={classes?.errorText} error={error} />
      )}
    </>
  );
}

export { FieldWrapper, VerticalFieldWrapper, HorizontalFieldWrapper };
