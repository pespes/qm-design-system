import type { Ref } from 'react';
import type { CheckboxRootProps } from '@base-ui/react';
import type { ClassMap } from '@/types.js';

export type CheckboxMap = ClassMap<'root' | 'checkbox' | 'icon' | 'label'>;

export interface CheckboxProps extends Omit<CheckboxRootProps, 'ref'> {
  label: string;
  classes?: CheckboxMap;
  ref?: Ref<HTMLSpanElement | null> | undefined;
}
