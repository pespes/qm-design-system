import type React from 'react';
import type { ClassMap } from '@/types.js';

/** ClassMap pattern allows consumers to override styling for specific slots (root container, icon elements).
 * Only expose slots that are semantically significant to the component's styling needs. */
export type InputClassMap = ClassMap<'root' | 'icon'>;

export interface IconSlotProps {
  className?: string;
  size?: number | string;
}

/** InputProps extends as seen in primitives/input/input.tsx. If the primitive exports its own type
 * (e.g., BaseUI SelectPrimitive exports SelectRootProps), extend that instead. */
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
