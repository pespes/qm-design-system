import { Loader2Icon } from 'lucide-react';
import type { SpinnerProps } from './Spinner.types.js';
import { cn } from '@/utils/utils.js';

function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role='status'
      aria-label='Loading'
      size={size}
      className={cn('animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
