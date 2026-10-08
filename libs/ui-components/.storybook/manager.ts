import { createElement as h } from 'react';
import type { ChangeEvent } from 'react';
import { addons, types, useGlobals } from 'storybook/manager-api';
import { Form } from 'storybook/internal/components';
import { qmTheme } from './configs/theme';

// Keep in sync with the `brand` global in preview.ts (read by themeDecorator)
const BRANDS = ['Homeowner', 'Pro'] as const;

// A native select for the brand global, instead of Storybook's default toolbar menu button
function BrandSelect() {
  const [globals, updateGlobals] = useGlobals();
  return h(
    Form.Select,
    {
      'aria-label': 'Brand',
      value: globals['brand'] ?? BRANDS[0],
      onChange: (event: ChangeEvent<HTMLSelectElement>) =>
        updateGlobals({ brand: event.target.value }),
      style: { width: 'auto', margin: '0 6px' },
    },
    BRANDS.map((brand) => h('option', { key: brand, value: brand }, brand)),
  );
}

addons.register('level/brand-select', () => {
  addons.add('level/brand-select/tool', {
    type: types.TOOL,
    title: 'Brand',
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: () => h(BrandSelect),
  });
});

addons.setConfig({
  theme: qmTheme,
});
