import { useId } from 'react';
import type {
  TextAreaFieldProps,
  TextAreaFieldClassMap,
} from './TextAreaField.types.js';
import type { TextAreaProps } from '@/components/composed/textarea/TextArea.types.js';
import { Label } from '@/components/primitives/label/Label.js';
import { TextArea } from '@/components/composed/textarea/TextArea.js';

import { cn } from '@/utils/utils.js';

function TextAreaField({
  label: labelString,
  className,
  classes,
  testId,
  id,
  ref,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const { root, label, textarea, content, counter } = classes || {};
  const textareaClasses = {
    root: textarea,
    content,
    counter,
  } as TextAreaFieldClassMap;

  return (
    <div className={cn('flex flex-col items-start gap-100', className, root)}>
      <Label htmlFor={textareaId} type='emphasis' className={label}>
        {labelString}
      </Label>
      <TextArea
        {...(props as TextAreaProps)}
        id={textareaId}
        ref={ref}
        classes={textareaClasses}
        className={textarea}
        testId={testId ?? 'input-group-textarea'}
      />
    </div>
  );
}

export { TextAreaField };
