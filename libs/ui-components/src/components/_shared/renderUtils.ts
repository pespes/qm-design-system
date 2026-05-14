import React, { type HTMLProps } from 'react';
import type { ButtonState, ComponentRenderFn } from '@base-ui/react';

type ButtonRenderProps =
  | React.ReactElement
  | ComponentRenderFn<HTMLProps<HTMLButtonElement>, ButtonState>
  | undefined;

// A utility to help check the output of the Base UI render() prop passed to a Button component.
// Note that this does not test for if the render prop is passed a function instead of HTML tag. This will return false in that
// instance, assuming that the final output is indeed different from the native element.
export const resolveButtonTag = (render: ButtonRenderProps) => {
  if (!render) return true;
  if (React.isValidElement(render)) {
    return render.type === 'button';
  }
  return false;
};
