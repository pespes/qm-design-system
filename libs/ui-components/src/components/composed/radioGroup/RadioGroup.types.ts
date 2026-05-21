import type { Ref } from 'react';
import type {
  RadioRootProps,
  RadioGroupProps as GroupProps,
} from '@base-ui/react';
import type { ClassMap } from '@/types.js';

export type RadioItemMap = ClassMap<'option' | 'radio' | 'label'>;

export interface OptionProps extends Omit<RadioRootProps, 'value'> {
  value: string;
  label: string;
  ref?: Ref<HTMLSpanElement | null> | undefined;
  classes?: RadioItemMap;
}

export type RadioGroupMap = ClassMap<'root' | 'option' | 'radio' | 'label'>;

export interface RadioGroupProps extends GroupProps {
  classes?: RadioGroupMap;
  options: OptionProps[];
  orientation?: 'vertical' | 'horizontal';
}
