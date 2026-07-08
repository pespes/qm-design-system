import type { SwitchRootProps } from '@base-ui/react/switch';
import type { ClassMap } from '@/types.js';

export type SwitchClassMap = ClassMap<'root' | 'thumb'>;

export interface SwitchProps extends SwitchRootProps {
  size?: 'sm' | 'md' | 'lg';
  classes?: SwitchClassMap;
}
