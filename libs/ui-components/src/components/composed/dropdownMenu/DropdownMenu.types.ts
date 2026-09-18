import type { MouseEvent, ReactNode, Ref } from 'react';
import type { Menu } from '@base-ui/react/menu';
import type { ClassMap } from '@/types.js';

export const dropdownMenuTypes = ['menu', 'radio', 'checkbox'] as const;
export type DropdownMenuType = (typeof dropdownMenuTypes)[number];

export const dropdownMenuItemVariants = ['default', 'destructive'] as const;
export type DropdownMenuItemVariant = (typeof dropdownMenuItemVariants)[number];

export type DropdownMenuClassMap = ClassMap<
  | 'trigger'
  | 'content'
  | 'group'
  | 'groupLabel'
  | 'item'
  | 'itemIcon'
  | 'shortcut'
  | 'separator'
  | 'indicator'
>;

export type DropdownMenuValueType = string | number;

export interface DropdownMenuItemType {
  value: DropdownMenuValueType;
  label: string;
  disabled?: boolean;
  /** Figma "Show leading decoration" — the 20x20 leading slot. */
  icon?: ReactNode;
  /** Figma "Show trailing decoration" as text, e.g. a key command. */
  shortcut?: string;
  /** Figma MenuItem "Type" — destructive tints the row danger. */
  variant?: DropdownMenuItemVariant;
  /** Only honoured when the menu `type` is 'checkbox'. */
  checked?: boolean;
  /** Renders a separator directly beneath this item. */
  separatorAfter?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  ref?: Ref<HTMLDivElement>;
}

export interface DropdownMenuGroupType {
  groupLabel: string;
  items: DropdownMenuItemType[];
}

export type DropdownMenuItemsType =
  | DropdownMenuItemType[]
  | DropdownMenuGroupType[];

type DropdownMenuPositionProps = Pick<
  Menu.Positioner.Props,
  'align' | 'alignOffset' | 'side' | 'sideOffset'
>;

interface DropdownMenuBaseProps
  extends Omit<Menu.Root.Props, 'children'>,
    DropdownMenuPositionProps {
  items: DropdownMenuItemsType;
  /** Visible label on the trigger button. */
  triggerLabel: string;
  classes?: DropdownMenuClassMap;
  className?: string | undefined;
  triggerTestId?: string;
  ref?: Ref<HTMLButtonElement | null> | undefined;
}

/**
 * `type` discriminates the selection model, so radio-only and checkbox-only
 * handlers can never be supplied together.
 */
export type DropdownMenuProps =
  | (DropdownMenuBaseProps & {
      type?: 'menu';
      value?: never;
      defaultValue?: never;
      onValueChange?: never;
      onCheckedChange?: never;
    })
  | (DropdownMenuBaseProps & {
      type: 'radio';
      value?: DropdownMenuValueType;
      defaultValue?: DropdownMenuValueType;
      onValueChange?: (value: DropdownMenuValueType) => void;
      onCheckedChange?: never;
    })
  | (DropdownMenuBaseProps & {
      type: 'checkbox';
      onCheckedChange?: (
        value: DropdownMenuValueType,
        checked: boolean,
      ) => void;
      value?: never;
      defaultValue?: never;
      onValueChange?: never;
    });
