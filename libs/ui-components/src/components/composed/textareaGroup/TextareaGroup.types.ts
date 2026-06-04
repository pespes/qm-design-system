import type { ClassMap } from '@/types.js';
import type { TextAreaProps } from '@/components/composed/textarea/TextArea.types.js';

export type TextAreaGroupClassMap = ClassMap<
  'root' | 'textarea' | 'content' | 'label' | 'counter'
>;

export interface TextAreaGroupProps extends Omit<TextAreaProps, 'classes'> {
  label: string;
  classes?: TextAreaGroupClassMap;
}
