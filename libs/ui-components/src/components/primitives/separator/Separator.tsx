import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import type { SeparatorProps } from './Separator.types.js';

import { cn } from '@/utils/utils.js';

const SPACING_HORIZONTAL = {
  none: 'h-px',
  sm: 'h-200',
  md: 'h-400',
} as const;

const SPACING_VERTICAL = {
  none: 'w-px',
  sm: 'w-200',
  md: 'w-400',
} as const;

function Separator({
  className,
  orientation = 'horizontal',
  spacing = 'none',
  ...props
}: SeparatorProps) {
  const spacingClass =
    orientation === 'vertical'
      ? SPACING_VERTICAL[spacing]
      : SPACING_HORIZONTAL[spacing];

  return (
    <SeparatorPrimitive
      data-slot='separator'
      orientation={orientation}
      className={cn(
        'flex items-center justify-center shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full',
        'before:bg-border-subtle data-[orientation=horizontal]:before:w-full data-[orientation=horizontal]:before:h-px data-[orientation=vertical]:before:w-px data-[orientation=vertical]:before:self-stretch',
        spacingClass,
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
