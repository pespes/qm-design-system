import { type ReactElement, useId, isValidElement } from 'react';

import type {
  ControlRenderProps,
  FieldErrorType,
  FieldWrapperProps,
  FieldOrientationProps,
  FieldSetWrapperProps,
} from './FieldWrappers.types.js';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldSet,
  FieldLegend,
} from '@/components/primitives/field/field.js';
import { cn } from '@/utils/utils.js';
import { cleanErrorMessages } from '@/components/_shared/validationUtils.js';

// Shared logic for FieldWrapper and FieldSetWrapper for ID generation and aria attributes
function useFieldState(
  error: FieldErrorType,
  invalid: boolean | undefined,
  description: string | ReactElement | undefined,
  required: boolean | undefined,
  controlId: string | undefined,
) {
  const generatedId = useId();
  const descId = useId();
  const errorId = useId();

  const childId = controlId ?? generatedId;

  const errorContent = cleanErrorMessages(error);
  const isInvalid = invalid ?? errorContent.length > 0;

  // Only include ids of descriptive / error text rendered (Description read before Error text)
  const describedBy =
    [
      description ? descId : undefined,
      errorContent.length > 0 ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const controlProps: ControlRenderProps = {
    id: childId,
    'aria-invalid': isInvalid ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required ? true : undefined,
  };

  return {
    childId,
    descId,
    errorId,
    isInvalid,
    errorContent,
    describedBy,
    controlProps,
  };
}

function FieldWrapper({
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  controlId,
  classes,
  reverse,
  orientation = 'vertical',
  children,
}: FieldWrapperProps) {
  const { descId, errorId, childId, isInvalid, controlProps } = useFieldState(
    error,
    invalid,
    description,
    required,
    controlId,
  );
  const labelIsElement = isValidElement(label);
  const renderedLabel = labelIsElement ? (
    label
  ) : (
    <FieldLabel htmlFor={childId} type='emphasis' className={classes?.label}>
      {label}
    </FieldLabel>
  );

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

function FieldSetWrapper({
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  controlId,
  classes,
  children,
}: FieldSetWrapperProps) {
  const legendId = useId();
  const { descId, errorId, isInvalid, controlProps } = useFieldState(
    error,
    invalid,
    description,
    required,
    controlId,
  );

  const { root, ...contentClasses } = classes || {};

  const groupControlProps: ControlRenderProps = {
    ...controlProps,
    'aria-labelledby': label ? legendId : undefined,
  };

  return (
    <FieldSet
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
      className={root}
    >
      <div>
        {label && (
          <FieldLegend
            id={legendId}
            variant='label'
            className={contentClasses?.label}
          >
            {label}
          </FieldLegend>
        )}
        {description && (
          <FieldDescription
            id={descId}
            className={contentClasses?.descriptionText}
          >
            {description}
          </FieldDescription>
        )}
        {error && (
          <FieldError
            id={errorId}
            className={cn('!mt-0', contentClasses?.errorText)}
            error={error}
          />
        )}
      </div>
      {children(groupControlProps)}
    </FieldSet>
  );
}

export {
  FieldWrapper,
  VerticalFieldWrapper,
  HorizontalFieldWrapper,
  FieldSetWrapper,
};
