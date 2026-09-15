import React, { useId, useState } from 'react';
import { EyeOffIcon, EyeIcon } from 'lucide-react';
import type { InputProps, IconSlotProps } from './Input.types.js';

/** Composed Input component imports sub-components from primitives/input/input-group.
This establishes the composition hierarchy: Input.tsx orchestrates InputGroup + InputGroupInput + addons. */

import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupIconButton,
} from '@/components/primitives/input/input-group.js';
import { cn } from '@/utils/utils.js';

/** Composed components add higher-level behavior (password toggle, adornment management)
on top of primitives. This is where use state, conditional rendering, and prop transformation happens. */
function Input({
  size = 'default',
  type,
  startAdornment,
  endAdornment,
  hasVisibilityToggle = true,
  togglePasswordText = { show: 'Show password', hide: 'Hide password' },
  classes,
  className,
  ref,
  testId,
  passwordTestId,
  ...props
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const isPasswordToggle = type === 'password' && hasVisibilityToggle;
  const inputType = isPasswordToggle && passwordVisible ? 'text' : type;

  /** Use helper functions for recurring render logic (renderIcon, renderEndAdornment).
  This keeps JSX readable and centralizes styling/transformation rules. */

  // The icon rendered within the start / endAdornments should always be size 20, no matter the size of the input.
  const renderIcon = (el: React.ReactElement<IconSlotProps>) => {
    return React.cloneElement(el, {
      size: 20,
      className: cn('aspect-square', classes?.icon),
    });
  };

  /** Conditional prop override. When an input with type='password' + toggle enabled, prioritize the built-in
  password toggle over any endAdornment. This prevents conflicting end elements and ensures
  the password button is always accessible with proper aria labels. */
  const renderEndAdornment = () => {
    if (isPasswordToggle) {
      const passwordIcon = passwordVisible ? <EyeIcon /> : <EyeOffIcon />;
      const togglePasswordVisible = () => setPasswordVisible((prev) => !prev);
      const passwordLabel = passwordVisible
        ? togglePasswordText.hide
        : togglePasswordText.show;

      /** Interactive elements (InputGroupIconButton) use onClick + aria-pressed.
       Non-interactive icons (InputGroupAddon) are aria-hidden. See input-group.tsx for details.*/
      return (
        <InputGroupIconButton
          label={passwordLabel}
          align='inline-end'
          disabled={props.disabled ?? false}
          onClick={togglePasswordVisible}
          aria-pressed={passwordVisible}
          aria-controls={inputId}
          data-testid={passwordTestId}
        >
          {renderIcon(passwordIcon)}
        </InputGroupIconButton>
      );
    }
    if (endAdornment) {
      return (
        <InputGroupAddon align='inline-end'>
          {renderIcon(endAdornment)}
        </InputGroupAddon>
      );
    }
    return null;
  };

  /** Composed component orchestrates sub-components from input-group, which manage all border/focus-ring/disabled styling. */
  return (
    <InputGroup className={cn(className, classes?.root)}>
      {startAdornment && (
        <InputGroupAddon align='inline-start'>
          {renderIcon(startAdornment)}
        </InputGroupAddon>
      )}
      <InputGroupInput
        {...props}
        /** ref is passed to the element that receives focus */
        ref={ref}
        type={inputType}
        /** Allow for custom data-testid to be provided, otherwise provide fallback */
        data-testid={testId ?? 'input-group-input'}
        size={size}
        id={inputId}
      />
      {renderEndAdornment()}
    </InputGroup>
  );
}

export { Input };
