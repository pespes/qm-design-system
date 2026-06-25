import type { ClassMap } from '@/types.js';
import type { TextAreaProps } from '@/components/composed/textarea/TextArea.types.js';

export type TextAreaFieldClassMap = ClassMap<
  'root' | 'textarea' | 'content' | 'label' | 'counter'
>;

export interface TextAreaFieldProps extends Omit<TextAreaProps, 'classes'> {
  label: string;
  classes?: TextAreaFieldClassMap;
}
