import type { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type { ClassMap } from '@/types.js';

export const AVATAR_SIZE_TYPES = ['sm', 'md', 'lg'] as const;

export type AvatarSize = (typeof AVATAR_SIZE_TYPES)[number];

export type AvatarClassMap = ClassMap<'root' | 'image' | 'fallback'>;

export interface AvatarProps
  extends Omit<AvatarPrimitive.Root.Props, 'children'> {
  /** Person or entity the avatar represents. Used as the image's alt text and as the fallback's accessible name. */
  alt: string;
  /** Image URL. When omitted, or if the image fails to load, the fallback is shown. */
  src?: string | undefined;
  /** Initials shown when there is no image (1–2 characters). */
  fallback: string;
  size?: AvatarSize;
  onLoadingStatusChange?: AvatarPrimitive.Image.Props['onLoadingStatusChange'];
  classes?: AvatarClassMap;
}
