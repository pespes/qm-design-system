import type { AvatarProps } from './Avatar.types.js';
import {
  Avatar as AvatarRoot,
  AvatarImage,
  AvatarFallback,
} from '@/components/primitives/avatar/avatar.js';
import { cn } from '@/utils/utils.js';

function Avatar({
  alt,
  src,
  fallback,
  size = 'md',
  onLoadingStatusChange,
  className,
  classes,
  ...props
}: AvatarProps) {
  return (
    <AvatarRoot size={size} className={cn(className, classes?.root)} {...props}>
      {src && (
        <AvatarImage
          src={src}
          alt={alt}
          onLoadingStatusChange={onLoadingStatusChange}
          className={classes?.image}
        />
      )}
      {/* role="img" so screen readers announce the name instead of spelling out the initials */}
      <AvatarFallback role='img' aria-label={alt} className={classes?.fallback}>
        {fallback}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export { Avatar };
