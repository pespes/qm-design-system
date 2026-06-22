import type { SwitchProps } from '@/components/primitives/switch/Switch.types.js';
import type { FieldWrapperProps } from '@/components/composed/field/FieldWrappers.types.js';
import type { ClassMap } from '@/types.js';

export type SwitchFieldClassMap = ClassMap<
  'label' | 'descriptionText' | 'errorText' | 'switch' | 'thumb'
>;

export type SwitchFieldProps = Omit<SwitchProps, 'classes'> &
  Omit<FieldWrapperProps, 'children'> & {
    classes?: SwitchFieldClassMap;
    reverse?: boolean | undefined;
  };
