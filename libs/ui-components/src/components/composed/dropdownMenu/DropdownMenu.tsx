import { Fragment } from 'react';
import type {
  DropdownMenuProps,
  DropdownMenuItemType,
  DropdownMenuGroupType,
  DropdownMenuItemsType,
  DropdownMenuClassMap,
  DropdownMenuType,
  DropdownMenuValueType,
} from './DropdownMenu.types.js';
import { cn } from '@/utils/utils.js';
import {
  DropdownMenu as DropdownMenuRoot,
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
} from '@/components/primitives/dropdownMenu/dropdown-menu.js';

function isGroupedItems(
  items: DropdownMenuItemsType,
): items is DropdownMenuGroupType[] {
  const firstItem = items[0];
  return firstItem !== undefined && 'groupLabel' in firstItem;
}

interface RenderItemArgs {
  item: DropdownMenuItemType;
  type: DropdownMenuType;
  classes: DropdownMenuClassMap | undefined;
  onCheckedChange:
    | ((value: DropdownMenuValueType, checked: boolean) => void)
    | undefined;
}

/**
 * Figma renders the leading decoration and the trailing key command as
 * fixed slots, so both are emitted around the label rather than by the caller.
 */
function renderItemContent(
  item: DropdownMenuItemType,
  classes: DropdownMenuClassMap | undefined,
) {
  return (
    <>
      {item.icon ? (
        <span
          data-slot='dropdown-menu-item-icon'
          aria-hidden
          className={cn(
            'flex size-500 shrink-0 items-center justify-center',
            classes?.itemIcon,
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span className='flex-1 min-w-0 truncate text-left'>{item.label}</span>
      {item.shortcut ? (
        <DropdownMenuShortcut className={classes?.shortcut}>
          {item.shortcut}
        </DropdownMenuShortcut>
      ) : null}
    </>
  );
}

function renderItem({ item, type, classes, onCheckedChange }: RenderItemArgs) {
  const sharedProps = {
    ref: item.ref,
    disabled: item.disabled,
    className: cn(classes?.item),
    'data-testid': `dropdown-menu-item-${item.value}`,
  };
  const content = renderItemContent(item, classes);

  if (type === 'checkbox') {
    return (
      <DropdownMenuCheckboxItem
        {...sharedProps}
        indicatorClassName={classes?.indicator}
        checked={item.checked ?? false}
        onCheckedChange={(checked) => onCheckedChange?.(item.value, checked)}
        closeOnClick={false}
      >
        {content}
      </DropdownMenuCheckboxItem>
    );
  }

  if (type === 'radio') {
    return (
      <DropdownMenuRadioItem
        {...sharedProps}
        indicatorClassName={classes?.indicator}
        value={item.value}
      >
        {content}
      </DropdownMenuRadioItem>
    );
  }

  return (
    <DropdownMenuItem
      {...sharedProps}
      variant={item.variant ?? 'default'}
      onClick={item.onClick}
    >
      {content}
    </DropdownMenuItem>
  );
}

function DropdownMenu({
  ref,
  items,
  type = 'menu',
  triggerLabel,
  classes,
  className,
  triggerTestId = 'dropdown-menu-trigger',
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  value,
  defaultValue,
  onValueChange,
  onCheckedChange,
  ...props
}: DropdownMenuProps) {
  function renderItemList(list: DropdownMenuItemType[]) {
    return list.map((item) => (
      <Fragment key={item.value}>
        {renderItem({ item, type, classes, onCheckedChange })}
        {item.separatorAfter ? (
          <DropdownMenuSeparator className={classes?.separator} />
        ) : null}
      </Fragment>
    ));
  }

  const menuBody = isGroupedItems(items)
    ? items.map((group) => (
        <DropdownMenuGroup key={group.groupLabel} className={classes?.group}>
          <DropdownMenuLabel className={classes?.groupLabel}>
            {group.groupLabel}
          </DropdownMenuLabel>
          {renderItemList(group.items)}
        </DropdownMenuGroup>
      ))
    : renderItemList(items);

  return (
    <DropdownMenuRoot {...props}>
      <DropdownMenuTrigger
        ref={ref}
        data-testid={triggerTestId}
        className={cn(className, classes?.trigger)}
      >
        {triggerLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={classes?.content}
      >
        {type === 'radio' ? (
          <DropdownMenuRadioGroup
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
          >
            {menuBody}
          </DropdownMenuRadioGroup>
        ) : (
          menuBody
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export { DropdownMenu };
