import type {
  SelectProps,
  FlatItemType,
  GroupedItemType,
  GroupedItemProps,
  SelectItemClassMap,
  SelectOverlayClassMap,
} from './Select.types.js';
import { cn } from '@/utils/utils.js';
import {
  Select as SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from '@/components/primitives/select/select.js';
import { Separator } from '@/components/primitives/separator/Separator.js';

function Select({
  ref,
  items,
  classes,
  className,
  placeholder,
  error,
  triggerTestId,
  ...props
}: SelectProps) {
  const {
    item,
    selectItemIcon,
    overlay,
    scrollBtn,
    groupLabel: groupLabelClasses,
  } = classes || {};
  const selectItemClasses = {
    root: item,
    selectItemIcon,
  } as SelectItemClassMap;
  const overlayClasses = {
    root: overlay,
    scrollBtn,
  } as SelectOverlayClassMap;

  function isGroupedItems() {
    if (!Array.isArray(items) || items.length === 0) return false;
    const firstItem = items[0];
    return firstItem !== undefined && 'groupLabel' in firstItem;
  }

  const renderItems = isGroupedItems()
    ? (items as GroupedItemType[]).map((group, groupIdx, arr) => (
        <>
          <SelectGroupedItem
            key={groupIdx}
            item={group}
            labelClassName={groupLabelClasses}
            classes={selectItemClasses}
          />
          {groupIdx < arr.length - 1 && (
            <Separator
              orientation='horizontal'
              spacing='sm'
              aria-hidden={true}
            />
          )}
        </>
      ))
    : (items as FlatItemType[])?.map((flatItem, idx) => (
        <SelectItem
          key={idx}
          value={flatItem.value}
          disabled={flatItem.disabled || props.disabled}
          classes={selectItemClasses}
          ref={flatItem.ref}
        >
          {flatItem.label}
        </SelectItem>
      ));

  const resolvedPlaceholder = placeholder ?? 'Choose an option';

  // Compute a trigger button's title from the current value's label, or fall back to placeholder.
  // This gives the button an accessible name without requiring a manual aria-label in order to pass a11y tests.
  // The title is lower in priority to aria-label, so when a label is passed to it (as is strongly
  // recommended in documentation), it will take precendence over this fallback.
  const resolvedTriggerTitle = (() => {
    if (props.value && items) {
      const flatItems = isGroupedItems()
        ? (items as GroupedItemType[]).flatMap((g) => g.items)
        : ((items as FlatItemType[] | undefined) ?? []);
      const match = flatItems.find((item) => item.value === props.value);
      if (match) return String(match.label);
    }
    return resolvedPlaceholder;
  })();

  return (
    <SelectRoot items={items} {...props}>
      <SelectTrigger
        ref={ref}
        aria-invalid={!!error}
        className={cn(className, classes?.trigger)}
        data-testid={triggerTestId ?? 'select-trigger'}
        title={resolvedTriggerTitle}
      >
        <SelectValue
          placeholder={resolvedPlaceholder}
          className={classes?.triggerContent}
        />
      </SelectTrigger>
      <SelectContent
        classes={overlayClasses}
        alignItemWithTrigger={!!items?.length}
      >
        {!!items?.length && renderItems}
      </SelectContent>
    </SelectRoot>
  );
}

function SelectGroupedItem({
  classes,
  labelClassName,
  disabled,
  item: groupItem,
}: GroupedItemProps) {
  const { items, groupLabel } = groupItem;
  return (
    <SelectGroup>
      <SelectLabel className={labelClassName}>{groupLabel}</SelectLabel>
      {items.map((flatItem, idx) => (
        <SelectItem
          key={idx}
          value={flatItem.value}
          disabled={flatItem.disabled || disabled}
          classes={classes ?? {}}
          ref={flatItem.ref}
        >
          {flatItem.label}
        </SelectItem>
      ))}
    </SelectGroup>
  );
}

export { Select };
