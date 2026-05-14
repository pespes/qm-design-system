import type { ReactElement } from 'react';
import type { Button as BaseButton } from '@base-ui/react/button';
import type { ClassMap } from '../../../types.js';
import type { IconSlotProps } from '../../_shared/iconSlot.js';

export const VARIANT_TYPES = [
  'primary',
  'secondary',
  'outline',
  'brand',
  'danger',
  'ghost',
] as const;

export const SIZE_TYPES = ['sm', 'md', 'lg'] as const;

type Variant = (typeof VARIANT_TYPES)[number];
type Size = (typeof SIZE_TYPES)[number];

export type IconButtonClassMap = ClassMap<'root' | 'icon'>;

export interface IconButtonProps extends BaseButton.Props {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  label: string;
  loading?: { title: string; state: 'active' | 'loading' };
  classes?: IconButtonClassMap;
  children: ReactElement<IconSlotProps>;
}
