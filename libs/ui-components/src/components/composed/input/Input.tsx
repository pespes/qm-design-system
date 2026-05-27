import React, { useId, useState } from 'react';
import { EyeOffIcon, EyeIcon } from 'lucide-react';
import type { InputProps, IconSlotProps } from './Input.types.js';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupIconButton,
} from '@/components/primitives/input/input-group.js';
import { cn } from '@/utils/utils.js';

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

  // The icon rendered within the start / endAdornments should always be size 20,
  // no matter the size of the input
  const renderIcon = (el: React.ReactElement<IconSlotProps>) => {
    return React.cloneElement(el, {
      size: 20,
      className: cn('aspect-square', classes?.icon),
    });
  };

  // If rendering an input with type='password' and hasVisibilityToggle=true, then overwrite any endAdornment prop
  const renderEndAdornment = () => {
    if (isPasswordToggle) {
      const passwordIcon = passwordVisible ? <EyeIcon /> : <EyeOffIcon />;
      const togglePasswordVisible = () => setPasswordVisible((prev) => !prev);
      const passwordLabel = passwordVisible
        ? togglePasswordText.hide
        : togglePasswordText.show;
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

  return (
    <InputGroup className={cn(className, classes?.root)}>
      {startAdornment && (
        <InputGroupAddon align='inline-start'>
          {renderIcon(startAdornment)}
        </InputGroupAddon>
      )}
      <InputGroupInput
        {...props}
        ref={ref}
        type={inputType}
        data-testid={testId ?? 'input-group-input'}
        size={size}
        id={inputId}
      />
      {renderEndAdornment()}
    </InputGroup>
  );
}

export { Input };
