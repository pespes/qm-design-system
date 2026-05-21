import * as React from 'react';
import type { LabelProps } from './Label.types.js';
import { cn } from '@/utils/utils.js';

function Label({ type = 'default', className, ...props }: LabelProps) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot='label'
      className={cn(
        'flex items-center gap-2 leading-none select-none group-data-disabled:pointer-events-none group-data-disabled:text-state-disabled peer-data-disabled:cursor-default peer-data-disabled:text-state-disabled peer-aria-invalid:text-status-danger-text',
        type === 'default' ? 'type-body-default' : 'type-ui-default',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
