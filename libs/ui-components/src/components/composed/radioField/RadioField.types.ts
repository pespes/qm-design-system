import type { RadioGroupProps } from '@base-ui/react';
import type { ClassMap } from '@/types.js';
import type { FieldSetWrapperProps } from '@/components/composed/field/FieldWrappers.types.js';
import type { OptionProps as RadioGroupItemProps } from '@/components/composed/radioGroup/RadioGroup.types.js';

export type RadioFieldMap = ClassMap<
  | 'root'
  | 'label'
  | 'descriptionText'
  | 'errorText'
  | 'option'
  | 'radio'
  | 'radioLabel'
  | 'radioDescriptionText'
>;

export interface RadioFieldProps
  extends Omit<RadioGroupProps, 'children'>,
    Omit<FieldSetWrapperProps, 'children'> {
  options: RadioGroupItemProps[];
  classes?: RadioFieldMap;
}
