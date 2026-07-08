import type { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import type { ClassMap } from '@/types.js';

export type CheckboxGroupMap = ClassMap<'root'>;

export interface CheckboxGroupProps extends CheckboxGroupPrimitive.Props {
  classes?: CheckboxGroupMap | undefined;
}
