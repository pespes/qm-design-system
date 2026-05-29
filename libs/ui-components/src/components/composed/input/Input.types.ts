import type React from 'react';
import type { ClassMap } from '@/types.js';

export type InputClassMap = ClassMap<'root' | 'icon'>;

export interface IconSlotProps {
  className?: string;
  size?: number | string;
}

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'> {
  size?: 'default' | 'lg';
  startAdornment?: React.ReactElement<IconSlotProps>;
  endAdornment?: React.ReactElement<IconSlotProps>;
  hasVisibilityToggle?: boolean;
  togglePasswordText?: { hide: string; show: string };
  testId?: string | undefined;
  passwordTestId?: string;
  classes?: InputClassMap;
}
