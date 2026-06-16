import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react';
import type { ClassMap } from '@/types.js';
import { cn } from '@/utils/utils.js';

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot='select-group'
      className={cn('scroll-my-050', className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot='select-value'
      className={cn('flex-1 min-w-0 truncate text-left', className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot='select-trigger'
      className={cn(
        'flex min-w-[320px] w-[320px] justify-between bg-transparent type-ui-default h-1000 gap-150 px-300 py-250 rounded-400 border-base-border border-1 text-base-text',
        'disabled:border-border-subtle disabled:text-state-disabled disabled:[&_svg]:text-state-disabled aria-invalid:border-2 aria-invalid:border-status-danger-border-strong',
        'focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle',
        'hover:bg-state-hover-on-light active:bg-state-pressed-on-light data-placeholder:text-foreground-subtle disabled:data-placeholder:text-state-disabled',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className='pointer-events-none shrink-0 size-400 text-base-text ' />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  > & {
    classes: ClassMap<'root' | 'scrollBtn'>;
    loading?: boolean | undefined;
  };

function SelectContent({
  className,
  classes,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className='isolate z-50'
      >
        <SelectPrimitive.Popup
          style={{ width: 'var(--anchor-width)', minWidth: '320px' }}
          data-slot='select-content'
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 outline-hidden min-w-[3320px] w-full min-h-1000 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto p-100 rounded-400 border-1 border-border-subtle bg-surface-default text-base-text shadow-300',
            classes?.root,
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton className={classes?.scrollBtn} />
          <SelectPrimitive.List className='p-100 flex flex-col gap-150'>
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton className={classes?.scrollBtn} />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot='select-label'
      className={cn(
        'px-150 py-050 type-body-caption text-foreground-subtle',
        className,
      )}
      {...props}
    />
  );
}

function SelectOverallLabel({
  className,
  ...props
}: SelectPrimitive.Label.Props) {
  return (
    <SelectPrimitive.Label
      data-slot='select-label'
      className={cn(
        'px-150 py-050 type-body-caption text-foreground-subtle',
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  classes,
  children,
  ...props
}: SelectPrimitive.Item.Props & {
  classes: ClassMap<'root' | 'selectItemIcon'>;
}) {
  return (
    <SelectPrimitive.Item
      data-slot='select-item'
      className={cn(
        'relative flex w-full cursor-default items-center gap-150 rounded-400 py-100 pl-150 pr-600 type-ui-default select-none',
        'focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2 select-none focus-visible:ring-2 focus-visible:ring-border-subtle',
        'hover:bg-state-hover-on-light pressed:bg-state-pressed-on-light',
        'data-disabled:pointer-events-none data-disabled:text-state-disabled [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-400 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-200',
        className,
        classes?.root,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className='min-w-0 truncate gap-2'>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className='pointer-events-none absolute right-200 flex items-center justify-center' />
        }
      >
        <CheckIcon
          data-testid='select-item-icon'
          className={cn(
            'pointer-events-none shrink-0 size-400',
            classes?.selectItemIcon,
          )}
        />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot='select-scroll-up-button'
      className={cn(
        "sticky top-0 z-10 flex w-full cursor-default items-center justify-center bg-surface-default py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot='select-scroll-down-button'
      className={cn(
        "sticky bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-surface-default py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectOverallLabel,
};
