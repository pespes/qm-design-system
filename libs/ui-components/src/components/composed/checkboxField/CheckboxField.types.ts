import type { ClassMap } from '@/types.js';
import type { FieldSetWrapperProps } from '@/components/composed/field/FieldWrappers.types.js';
import type { CheckboxGroupProps } from '@/components/primitives/checkboxGroup/CheckboxGroup.types.js';

export type CheckboxFieldMap = ClassMap<
  'root' | 'label' | 'descriptionText' | 'errorText' | 'checkboxGroup'
>;

export interface CheckboxFieldProps
  extends Omit<FieldSetWrapperProps, 'children'>,
    Omit<CheckboxGroupProps, 'classes'> {
  children: React.ReactNode;
  classes?: CheckboxFieldMap;
}
