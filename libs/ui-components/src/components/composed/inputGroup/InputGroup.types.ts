import type { ClassMap } from '@/types.js';
import type { InputProps } from '@/components/composed/input/Input.types.js';

export type InputGroupClassMap = ClassMap<'root' | 'input' | 'icon' | 'label'>;

export interface InputGroupProps extends Omit<InputProps, 'classes'> {
  label: string;
  classes?: InputGroupClassMap;
}
