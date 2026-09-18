import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { ChevronRightIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';

import { cn } from '@/utils/utils.js';

/**
 * Shared focus ring, per componentGuide.md "Focus ring pattern".
 * Base UI drives focus state through :focus-visible on the rendered element.
 */
const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-border-subtle';

/**
 * Interaction state layers. Base UI marks the keyboard-highlighted item with
 * `data-highlighted`, so hover and highlight must resolve to the same surface.
 */
const STATE_LAYER =
  'data-highlighted:bg-state-hover-on-light active:bg-state-pressed-on-light';

/** Figma: leading/trailing decoration slot is a fixed 20x20 box. */
const DECORATION_SLOT =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-500";

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />;
}

function DropdownMenuTrigger({
  className,
  children,
  ...props
}: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot='dropdown-menu-trigger'
      className={cn(
        'flex w-full items-center justify-between bg-transparent type-ui-default h-1000 gap-150 px-300 py-250 rounded-400 border-1 border-base-border text-base-text select-none',
        'enabled:hover:bg-state-hover-on-light enabled:active:bg-state-pressed-on-light',
        'disabled:border-border-subtle disabled:text-state-disabled disabled:[&_svg]:text-state-disabled',
        FOCUS_RING,
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden
        className='pointer-events-none shrink-0 size-400 text-base-text'
      />
    </MenuPrimitive.Trigger>
  );
}

function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className='isolate z-50 outline-none'
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot='dropdown-menu-content'
          className={cn(
            'z-50 flex flex-col min-w-[300px] max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-hidden',
            'p-250 rounded-400 border-1 border-border-subtle bg-surface-default text-base-text shadow-300',
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />;
}

function DropdownMenuLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot='dropdown-menu-label'
      className={cn(
        'flex items-center min-h-[var(--spacing-600)] px-250 py-100 type-ui-caption text-foreground-subtle',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenuPrimitive.Item
      data-slot='dropdown-menu-item'
      data-variant={variant}
      className={cn(
        'group/dropdown-menu-item relative flex w-full cursor-default items-center select-none outline-hidden',
        'min-h-[var(--spacing-800)] gap-150 px-250 py-150 rounded-400 type-ui-default text-base-text',
        STATE_LAYER,
        'data-[variant=destructive]:bg-danger-background-subtlest data-[variant=destructive]:text-danger-text',
        'data-disabled:pointer-events-none data-disabled:text-state-disabled',
        DECORATION_SLOT,
        FOCUS_RING,
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot='dropdown-menu-sub' {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot='dropdown-menu-sub-trigger'
      className={cn(
        'relative flex w-full cursor-default items-center select-none outline-hidden',
        'min-h-[var(--spacing-800)] gap-150 px-250 py-150 rounded-400 type-ui-default text-base-text',
        STATE_LAYER,
        'data-popup-open:bg-state-hover-on-light',
        'data-disabled:pointer-events-none data-disabled:text-state-disabled',
        DECORATION_SLOT,
        FOCUS_RING,
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden className='ml-auto' />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot='dropdown-menu-sub-content'
      className={cn('min-w-[200px]', className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

/**
 * Figma places the checkbox indicator in the leading decoration slot,
 * unlike the radio indicator which trails the label.
 */
function DropdownMenuCheckboxItem({
  className,
  indicatorClassName,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  indicatorClassName?: string | undefined;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      className={cn(
        'relative flex w-full cursor-default items-center select-none outline-hidden',
        'min-h-[var(--spacing-800)] gap-150 px-250 py-150 rounded-400 type-ui-default text-base-text',
        STATE_LAYER,
        'data-disabled:pointer-events-none data-disabled:text-state-disabled',
        DECORATION_SLOT,
        FOCUS_RING,
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        data-slot='dropdown-menu-checkbox-item-indicator'
        className={cn(
          'pointer-events-none flex size-500 shrink-0 items-center justify-center rounded-200 border-1 border-border-default data-checked:border-brand-background data-checked:bg-brand-background',
          indicatorClassName,
        )}
        data-checked={checked || undefined}
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon aria-hidden className='size-400 text-brand-foreground' />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot='dropdown-menu-radio-group'
      {...props}
    />
  );
}

/** Figma trails the radio indicator after the label, right-aligned. */
function DropdownMenuRadioItem({
  className,
  indicatorClassName,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  indicatorClassName?: string | undefined;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot='dropdown-menu-radio-item'
      className={cn(
        'relative flex w-full cursor-default items-center select-none outline-hidden',
        'min-h-[var(--spacing-800)] gap-150 px-250 py-150 rounded-400 type-ui-default text-base-text',
        STATE_LAYER,
        'data-disabled:pointer-events-none data-disabled:text-state-disabled',
        DECORATION_SLOT,
        FOCUS_RING,
        className,
      )}
      {...props}
    >
      {children}
      <span
        data-slot='dropdown-menu-radio-item-indicator'
        className={cn(
          'pointer-events-none ml-auto flex size-500 shrink-0 items-center justify-center',
          indicatorClassName,
        )}
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon aria-hidden className='size-400 text-base-text' />
        </MenuPrimitive.RadioItemIndicator>
      </span>
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-250 my-100 h-px bg-border-subtle', className)}
      {...props}
    />
  );
}

/** Figma: trailing decoration slot rendered as text (e.g. a key command). */
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn(
        'ml-auto shrink-0 type-ui-default text-foreground-subtle',
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
