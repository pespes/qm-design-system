import { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/utils.js';
import { Label } from '@/components/primitives/label/Label.js';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot='field-set'
      className={cn(
        'flex flex-col gap-400 has-[>[data-slot=checkbox-group]]:gap-200 has-[>[data-slot=radio-group]]:gap-200',
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot='field-legend'
      data-variant={variant}
      className={cn(
        'data-[variant=label]:type-ui-default data-[variant=legend]:type-header-h2',
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-group'
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-500 data-[slot=checkbox-group]:gap-300 *:data-[slot=field-group]:gap-400',
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva('group/field flex gap-100', {
  variants: {
    orientation: {
      vertical: 'flex-col items-center *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'grid grid-cols-[1fr_auto] gap-x-400 items-center [grid-template-areas:"content_control"_"error_error"] [&>:not([data-slot])]:[grid-area:control]',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
    reverse: {
      true: '[grid-template-areas:"control_content"_"error_error"] grid-cols-[auto_1fr]',
      false: undefined,
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    reverse: false,
  },
});

function Field({
  className,
  orientation = 'vertical',
  reverse,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role='group'
      data-slot='field'
      data-orientation={orientation}
      data-horizontal={orientation === 'horizontal' ? 'true' : undefined}
      className={cn(fieldVariants({ orientation, reverse }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-content'
      className={cn(
        'group/field-content flex flex-1 flex-col leading-snug group-data-horizontal/field:[grid-area:content] group-data-horizontal/field:min-w-0',
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot='field-label'
      type='emphasis'
      className={cn(
        'group/field-label peer/field-label flex gap-200',
        '*:data-[slot=field]:p-250 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='field-description'
      className={cn(
        'text-foreground-subtle type-body-caption leading-normal [[data-variant=legend]+&]:-mt-150',
        'last:mt-0 nth-last-2:-mt-100',
        className,
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  error,
  ...props
}: React.ComponentProps<'div'> & {
  error?: string | { message: string } | Array<string | { message: string }>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!error) {
      return null;
    }

    const firstError = Array.isArray(error) ? error[0] : error;
    return typeof firstError === 'object' ? firstError.message : firstError;
  }, [children, error]);

  if (!content) {
    return null;
  }

  return (
    <div
      role='alert'
      data-slot='field-error'
      className={cn(
        'type-header-caption text-status-danger-text group-data-horizontal/field:[grid-area:error]',
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldContent,
};
