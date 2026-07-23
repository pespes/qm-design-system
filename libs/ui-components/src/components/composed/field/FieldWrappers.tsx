import { useId, isValidElement } from 'react';

import type {
  ControlRenderProps,
  FieldWrapperProps,
  FieldOrientationProps,
  FieldSetWrapperProps,
} from './FieldWrappers.types.js';
import { useFieldState } from './useFieldState.js';
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

function FieldWrapper({
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  controlId,
  labelId,
  classes,
  reverse,
  orientation = 'vertical',
  children,
}: FieldWrapperProps) {
  const labelIsElement = isValidElement(label);
  const { descId, errorId, childId, isInvalid, controlProps } = useFieldState(
    error,
    invalid,
    description,
    required,
    controlId,
    labelIsElement,
    labelId,
  );

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
  labelId,
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
    false,
    labelId,
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
      disabled={disabled || undefined}
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
