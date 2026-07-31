import React, { useEffect, useState, useId, useRef } from 'react';
import type { TextAreaProps } from './TextArea.types.js';
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from '@/components/primitives/input/input-group.js';
import { cn } from '@/utils/utils.js';

function TextArea({
  ref,
  testId,
  id,
  maxLength,
  maxLengthSRFunc,
  onChange,
  value,
  className,
  classes,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const limitRegionId = `${textareaId}-limit`;
  const counterId = `${textareaId}-counter`;

  const [internalValue, setInternalValue] = useState(value ?? '');
  const [limitMessage, setLimitMessage] = useState('');
  const limitToggle = useRef(false);

  const displayValue = value ?? internalValue;
  const charLength = String(displayValue).length;
  const counterColour =
    charLength > 0 ? 'text-foreground-default' : 'text-foreground-subtle';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // in case a user pastes text longer than the maxLength, trim the text
    // to the maxLength provided
    if (maxLength !== undefined && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }

    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  // Trigger a Character limit reached message whenever user hits limit
  useEffect(() => {
    if (maxLength && charLength === maxLength) {
      limitToggle.current = !limitToggle.current;
      const msg = maxLengthSRFunc({ count: charLength, maxLength });
      // append the 'zero-width space' unicode character that helps trick the
      // screen reader into thinking the message has changed and therefore read
      // the character limit announcement again if user hits the limit more than once
      setLimitMessage(msg + (limitToggle.current ? '\u200B' : ''));
    } else {
      setLimitMessage('');
    }
  }, [charLength, maxLength, maxLengthSRFunc]);

  const describedBy =
    [props['aria-describedby'], maxLength ? counterId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <InputGroup className={cn('relative', className, classes?.root)}>
      <InputGroupTextarea
        {...props}
        ref={ref}
        id={textareaId}
        value={displayValue}
        aria-describedby={describedBy}
        onChange={handleChange}
        maxLength={maxLength}
        data-testid={testId ?? 'input-group-textarea'}
        className={classes?.content}
      />

      {maxLength && (
        <>
          <InputGroupAddon align='block-end'>
            <InputGroupText
              id={counterId}
              className={cn(counterColour, classes?.counter)}
            >
              {`${charLength} / ${maxLength}`}
            </InputGroupText>
          </InputGroupAddon>

          {/* For screen readers - trigger message that character limit reached */}
          <div
            className='sr-only'
            id={limitRegionId}
            aria-live='assertive'
            aria-atomic='true'
          >
            {limitMessage}
          </div>
        </>
      )}
    </InputGroup>
  );
}

export { TextArea };
