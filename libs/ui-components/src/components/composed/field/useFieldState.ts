import { type ReactElement, useId } from 'react';
import type {
  FieldErrorType,
  ControlRenderProps,
} from './FieldWrappers.types.js';
import { parseErrorMessages } from '@/components/_shared/validationUtils.js';

// Shared logic for FieldWrapper and FieldSetWrapper for ID generation and aria attributes
function useFieldState(
  error: FieldErrorType,
  invalid: boolean | undefined,
  description: string | ReactElement | undefined,
  required: boolean | undefined,
  controlId: string | undefined,
  labelIsElement: boolean | undefined,
  labelId: string | undefined,
) {
  const generatedId = useId();
  const descId = useId();
  const errorId = useId();
  const generatedLabelId = useId();

  const childId = controlId ?? generatedId;
  const finalLabelId = labelId ?? generatedLabelId;

  const errorContent = parseErrorMessages(error);
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
    'aria-labelledby': labelIsElement ? finalLabelId : undefined,
  };

  return {
    childId,
    descId,
    errorId,
    labelId: finalLabelId,
    isInvalid,
    errorContent,
    describedBy,
    controlProps,
  };
}

export { useFieldState };
