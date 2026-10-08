import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cn } from '@/utils/utils.js';

function Avatar({
  className,
  size = 'md',
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      data-size={size}
      className={cn(
        // Stroke drawn as an overlay so it sits inside the circle without shrinking the image
        'group/avatar relative flex size-800 shrink-0 overflow-hidden rounded-full bg-brand-background select-none',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border-1 after:border-border-inverse',
        'data-[size=sm]:size-600 data-[size=lg]:size-1000',
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn(
        'aspect-square size-full rounded-full object-cover',
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-brand-background text-base-foreground type-header-caption',
        'group-data-[size=lg]/avatar:type-header-h4 group-data-[size=sm]/avatar:text-(length:--avatar-fallback-label-small)',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
