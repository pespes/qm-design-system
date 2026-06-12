import type { Ref } from 'react';
import type { SelectRootProps } from '@base-ui/react';
import type { ClassMap } from '@/types.js';

export type SelectClassMap = ClassMap<
  | 'trigger'
  | 'triggerContent'
  | 'overlay'
  | 'groupLabel'
  | 'item'
  | 'scrollBtn'
  | 'selectItemIcon'
>;

export type SelectItemClassMap = ClassMap<'root' | 'selectItemIcon'>;
export type SelectOverlayClassMap = ClassMap<'root' | 'scrollBtn'>;

export type SelectValueType = string | number | null;

export interface FlatItem {
  value: SelectValueType;
  label: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export interface GroupedItem {
  groupLabel: string;
  items: FlatItem[];
  [key: string]: unknown;
}

export type SelectItemsType = FlatItem[] | GroupedItem[];

export interface SelectProps
  extends Omit<SelectRootProps<SelectValueType, false>, 'items'> {
  items?: SelectItemsType;
  placeholder?: string;
  classes?: SelectClassMap;
  className?: string;
  triggerTestId?: string;
  error?: boolean;
  ref?: Ref<HTMLButtonElement | null> | undefined;
}
