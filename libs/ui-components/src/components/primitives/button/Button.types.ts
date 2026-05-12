import type { Button as BaseButton } from '@base-ui/react/button';
import type { ReactElement } from 'react';
import type { ClassMap } from '../../../types.js';

export const VARIANT_TYPES = [
  'primary',
  'secondary',
  'outline',
  'brand',
  'danger',
  'ghost',
] as const;

export const SIZE_TYPES = ['sm', 'md', 'lg'] as const;
export const RADIUS_TYPES = ['default', 'full'] as const;

export interface IconProps {
  className?: string;
  size?: number;
  'data-icon'?: 'inline-start' | 'inline-end';
}

type Variant = (typeof VARIANT_TYPES)[number];
type Size = (typeof SIZE_TYPES)[number];
type Radius = (typeof RADIUS_TYPES)[number];

export type ButtonClassMap = ClassMap<'root' | 'content' | 'icon'>;

export interface ButtonProps extends BaseButton.Props {
  variant?: Variant;
  size?: Size;
  rounded?: Radius;
  disabled?: boolean;
  icon?: { position: 'left' | 'right'; component: ReactElement<IconProps> };
  loading?: { title: string; state: 'active' | 'loading' };
  classes?: ButtonClassMap;
}
