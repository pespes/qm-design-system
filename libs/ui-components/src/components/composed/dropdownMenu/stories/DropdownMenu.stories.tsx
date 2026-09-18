import { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Trash2Icon, PencilIcon, CopyIcon } from 'lucide-react';
import { DropdownMenu } from '../DropdownMenu.js';
import type { DropdownMenuValueType } from '../DropdownMenu.types.js';
import {
  defaultTests,
  disabledTests,
  itemStateTests,
  groupedTests,
  radioTests,
  checkboxTests,
  refTests,
} from '../DropdownMenu.test.js';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  args: {
    triggerLabel: 'Actions',
    triggerTestId: 'test-dropdown-menu',
    type: 'menu',
    onOpenChange: fn(),
    items: [
      { value: 'edit', label: 'Menu item', onClick: fn() },
      { value: 'duplicate', label: 'Menu item', onClick: fn() },
      { value: 'rename', label: 'Menu item', onClick: fn() },
    ],
    classes: {
      trigger: '',
      content: '',
      group: '',
      groupLabel: '',
      item: '',
      itemIcon: '',
      shortcut: '',
      separator: '',
      indicator: '',
    },
    disabled: false,
  },
  argTypes: {
    type: {
      description:
        'Selection model for the menu: plain actions, single-select radio, or multi-select checkbox.',
      control: { type: 'select' },
      options: ['menu', 'radio', 'checkbox'],
    },
    triggerLabel: {
      description: 'Visible label rendered inside the trigger button.',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Disables the trigger so the menu cannot be opened.',
      control: { type: 'boolean' },
    },
    side: {
      description: 'Side of the trigger the menu is positioned against.',
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    align: {
      description: 'Alignment of the menu relative to the trigger.',
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    onOpenChange: {
      description: 'Fires whenever the menu opens or closes.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A button-triggered menu of actions. Supports plain action items, single-select radio items and multi-select checkbox items, with optional group labels, leading icons, key commands, separators and destructive styling.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: defaultTests,
};

export const WithIconsAndKeyCommands: Story = {
  args: {
    triggerTestId: 'decorated-dropdown-menu',
    items: [
      {
        value: 'edit',
        label: 'Key command',
        icon: <PencilIcon />,
        shortcut: '+ T',
        onClick: fn(),
      },
      {
        value: 'duplicate',
        label: 'Menu item',
        icon: <CopyIcon />,
        onClick: fn(),
      },
    ],
  },
};

export const Disabled: Story = {
  args: {
    triggerTestId: 'disabled-dropdown-menu',
    disabled: true,
  },
  play: disabledTests,
};

export const ItemStates: Story = {
  args: {
    triggerTestId: 'item-states-dropdown-menu',
    items: [
      { value: 'edit', label: 'Menu item', onClick: fn() },
      {
        value: 'disabled',
        label: 'Disabled item',
        disabled: true,
        separatorAfter: true,
        onClick: fn(),
      },
      {
        value: 'delete',
        label: 'Destructive item',
        variant: 'destructive',
        icon: <Trash2Icon />,
        onClick: fn(),
      },
    ],
  },
  play: itemStateTests,
};

export const Grouped: Story = {
  args: {
    triggerTestId: 'grouped-dropdown-menu',
    items: [
      {
        groupLabel: 'Group label',
        items: [
          {
            value: 'edit',
            label: 'Key command',
            shortcut: '+ T',
            onClick: fn(),
          },
          { value: 'duplicate', label: 'Menu item', onClick: fn() },
        ],
      },
      {
        groupLabel: 'Danger zone',
        items: [
          {
            value: 'delete',
            label: 'Destructive item',
            variant: 'destructive',
            icon: <Trash2Icon />,
            onClick: fn(),
          },
        ],
      },
    ],
  },
  play: groupedTests,
};

export const RadioItems: Story = {
  args: {
    triggerTestId: 'radio-dropdown-menu',
    type: 'radio',
    triggerLabel: 'Sort by',
    onValueChange: fn(),
    items: [
      { value: 'newest', label: 'Radio item' },
      { value: 'oldest', label: 'Selected radio item' },
      { value: 'name', label: 'Radio item' },
    ],
  },
  render: function RadioItemsStory(args) {
    const [selected, setSelected] = useState<DropdownMenuValueType | undefined>(
      undefined,
    );
    return (
      <DropdownMenu
        {...args}
        type='radio'
        value={selected}
        onValueChange={(next) => {
          args.onValueChange?.(next);
          setSelected(next);
        }}
      />
    );
  },
  play: radioTests,
};

export const CheckboxItems: Story = {
  args: {
    triggerTestId: 'checkbox-dropdown-menu',
    type: 'checkbox',
    triggerLabel: 'Columns',
    onCheckedChange: fn(),
    items: [
      { value: 'status', label: 'Check this box', checked: false },
      { value: 'owner', label: 'Checked box', checked: true },
      { value: 'updated', label: 'Check this box', checked: false },
    ],
  },
  render: function CheckboxItemsStory(args) {
    const [checkedValues, setCheckedValues] = useState<Record<string, boolean>>(
      { status: false, owner: true, updated: false },
    );
    return (
      <DropdownMenu
        {...args}
        type='checkbox'
        items={args.items.map((item) => ({
          ...item,
          checked: checkedValues[String(item.value)] ?? false,
        }))}
        onCheckedChange={(value, checked) => {
          args.onCheckedChange?.(value, checked);
          setCheckedValues((current) => ({
            ...current,
            [String(value)]: checked,
          }));
        }}
      />
    );
  },
  play: checkboxTests,
};

const triggerRef = createRef<HTMLButtonElement>();

export const ForwardedRef: Story = {
  args: {
    triggerTestId: 'ref-dropdown-menu',
    triggerLabel: 'Focus me',
    ref: triggerRef,
  },
  play: refTests,
};
