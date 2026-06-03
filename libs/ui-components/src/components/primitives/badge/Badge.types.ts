// import type { Button as BaseButton } from '@base-ui/react/button';
import type { ReactElement } from 'react';
import type { useRender } from '@base-ui/react/use-render';
import type { IconSlotProps } from '@/components/_shared/iconSlot.js';
import type { ClassMap } from '@/types.js';

export const BADGE_VARIANT_TYPES = [
  'base',
  'secondary',
  'outline',
  'brand',
  'destructive',
  'ghost',
] as const;

type Variant = (typeof BADGE_VARIANT_TYPES)[number];

export const STATUS_VARIANT_TYPES = [
  'danger',
  'success',
  'system',
  'warning',
] as const;

type StatusVariant = (typeof STATUS_VARIANT_TYPES)[number];

export type BadgeClassMap = ClassMap<'root' | 'content' | 'icon'>;

export interface BaseBadgeProps extends useRender.ComponentProps<'span'> {
  children: string | number | (string | number)[];
  icon?: { position: 'left' | 'right'; component: ReactElement<IconSlotProps> };
  classes?: BadgeClassMap;
}

export interface BadgeProps extends BaseBadgeProps {
  variant: Variant;
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant: StatusVariant;
}
