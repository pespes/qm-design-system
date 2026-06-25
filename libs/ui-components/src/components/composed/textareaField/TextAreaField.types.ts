import type { BaseFieldProps } from '../field/FieldWrappers.types.js';
import type { ClassMap } from '@/types.js';
import type { TextAreaProps } from '@/components/composed/textarea/TextArea.types.js';

export type TextAreaFieldClassMap = ClassMap<
  | 'root'
  | 'textarea'
  | 'content'
  | 'label'
  | 'counter'
  | 'errorText'
  | 'descriptionText'
>;

export type TextAreaFieldProps = Omit<TextAreaProps, 'testId'> &
  Omit<BaseFieldProps, 'children'> & {
    classes?: TextAreaFieldClassMap;
  };
