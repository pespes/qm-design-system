import type { BaseFieldProps } from '../field/FieldWrappers.types.js';
import type { ClassMap } from '@/types.js';
import type { InputProps } from '@/components/composed/input/Input.types.js';

export type InputFieldClassMap = ClassMap<
  'root' | 'input' | 'icon' | 'label' | 'errorText' | 'descriptionText'
>;

export interface InputFieldProps
  extends Omit<InputProps, 'classes' | 'children'>,
    Omit<BaseFieldProps, 'children'> {
  classes?: InputFieldClassMap;
}
