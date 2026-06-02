export const ICON_SIZES = {
  sm: 16,
  md: 16,
  lg: 20,
} as const;

export const ICON_POSITION = {
  left: 'inline-start',
  right: 'inline-end',
} as const;

export interface IconSlotProps {
  className?: string;
  size?: number | string;
  'data-icon'?: 'inline-start' | 'inline-end';
  'aria-hidden'?: boolean;
  'data-slot'?: 'icon';
}
