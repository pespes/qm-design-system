import type {
  SelectProps,
  FlatItem,
  GroupedItem,
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
  const { item, selectItemIcon, overlay, scrollBtn } = classes || {};
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

  const renderOptions = isGroupedItems()
    ? (items as GroupedItem[]).map((group, groupIdx, arr) => (
        <>
          <SelectGroup key={groupIdx}>
            <SelectLabel className={classes?.groupLabel}>
              {group.groupLabel as React.ReactNode}
            </SelectLabel>
            {group.items.map((flatItem, itemIdx) => (
              <SelectItem
                key={itemIdx}
                value={flatItem.value}
                disabled={flatItem.disabled || props.disabled}
                classes={selectItemClasses}
                ref={flatItem.ref}
              >
                {flatItem.label}
              </SelectItem>
            ))}
          </SelectGroup>
          {groupIdx < arr.length - 1 && (
            <Separator
              orientation='horizontal'
              spacing='sm'
              aria-hidden={true}
            />
          )}
        </>
      ))
    : (items as FlatItem[])?.map((flatItem, idx) => (
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
        ? (items as GroupedItem[]).flatMap((g) => g.items)
        : ((items as FlatItem[] | undefined) ?? []);
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
        {!!items?.length && renderOptions}
      </SelectContent>
    </SelectRoot>
  );
}

export { Select };
