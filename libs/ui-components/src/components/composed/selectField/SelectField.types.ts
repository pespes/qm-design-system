import type { BaseFieldProps } from '../field/FieldWrappers.types.js';
import type { ClassMap } from '@/types.js';
import type { SelectProps } from '@/components/composed/select/Select.types.js';

export type SelectFieldClassMap = ClassMap<
  | 'root'
  | 'trigger'
  | 'triggerContent'
  | 'overlay'
  | 'groupLabel'
  | 'item'
  | 'scrollBtn'
  | 'selectItemIcon'
  | 'label'
  | 'errorText'
  | 'descriptionText'
>;

export type SelectFieldProps = Omit<
  SelectProps,
  'classes' | 'children' | 'error' | 'testId'
> &
  Omit<BaseFieldProps, 'children'> & {
    classes?: SelectFieldClassMap;
  };
