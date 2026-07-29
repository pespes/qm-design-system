import type { BaseFieldProps } from '../field/FieldWrappers.types.js';
import type { ClassMap } from '@/types.js';
import type {
  BaseTextAreaProps,
  MaxLengthProps,
} from '@/components/composed/textarea/TextArea.types.js';

export type TextAreaFieldClassMap = ClassMap<
  | 'root'
  | 'textarea'
  | 'content'
  | 'label'
  | 'counter'
  | 'errorText'
  | 'descriptionText'
>;

export type TextAreaFieldProps = Omit<BaseTextAreaProps, 'testId'> &
  MaxLengthProps &
  Omit<BaseFieldProps, 'children'> & {
    classes?: TextAreaFieldClassMap;
  };
