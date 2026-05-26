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
  ...props
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const isPasswordToggle = type === 'password' && hasVisibilityToggle;
  const inputType = isPasswordToggle && passwordVisible ? 'text' : type;

  const renderIcon = (el: React.ReactElement<IconSlotProps>) => {
    return React.cloneElement(el, {
      size: 20,
      ...(!!classes?.icon && { className: cn('aspect-square', classes.icon) }),
    });
  };

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
    <InputGroup size={size} className={cn(className, classes?.root)}>
      {startAdornment && (
        <InputGroupAddon align='inline-start'>
          {renderIcon(startAdornment)}
        </InputGroupAddon>
      )}
      <InputGroupInput ref={ref} type={inputType} {...props} id={inputId} />
      {renderEndAdornment()}
    </InputGroup>
  );
}

export { Input };
