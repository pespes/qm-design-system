import type { Decorator } from '@storybook/react-vite';

export const themeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.brand?.toLowerCase();
  return (
    <div data-theme={theme}>
      <Story />
    </div>
  );
};
