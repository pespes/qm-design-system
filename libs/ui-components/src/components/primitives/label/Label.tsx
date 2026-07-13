import * as React from 'react';
import type { LabelProps } from './Label.types.js';
import { cn } from '@/utils/utils.js';

const labelBaseClassName =
  'flex items-center gap-200 w-full select-none text-foreground-default ' +
  'group-data-disabled:pointer-events-none group-data-[disabled=true]/field:text-state-disabled ' +
  'peer-data-disabled:cursor-default peer-data-disabled:text-state-disabled group-has-[>[aria-disabled]]/field:text-state-disabled ' +
  'peer-aria-invalid:text-status-danger-text ';

function Label({ type = 'default', className, ...props }: LabelProps) {
  return (
    <label
      data-slot='label'
      className={cn(
        labelBaseClassName,
        type === 'default' ? 'type-body-default' : 'type-ui-default',
        className,
      )}
      {...props}
    />
  );
}

export { Label, labelBaseClassName };
