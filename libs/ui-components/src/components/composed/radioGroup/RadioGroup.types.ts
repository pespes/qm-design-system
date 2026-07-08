import type { Ref } from 'react';
import type {
  RadioRootProps,
  RadioGroupProps as GroupProps,
} from '@base-ui/react';
import type { ClassMap } from '@/types.js';

export type RadioItemMap = ClassMap<
  'option' | 'radio' | 'label' | 'descriptionText'
>;

export interface OptionProps extends Omit<RadioRootProps, 'value'> {
  value: string;
  label: string;
  description?: string;
  ref?: Ref<HTMLSpanElement | null> | undefined;
  classes?: RadioItemMap;
  // Validation states passed from parent RadioField (through RadioGroup)
  invalid?: boolean | undefined;
  required?: boolean | undefined;
}

export type RadioGroupMap = ClassMap<
  'root' | 'option' | 'radio' | 'label' | 'descriptionText'
>;

export interface RadioGroupProps extends GroupProps {
  classes?: RadioGroupMap;
  options: OptionProps[];
}
