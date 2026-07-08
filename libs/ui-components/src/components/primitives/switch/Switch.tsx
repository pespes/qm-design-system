import React from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import type { SwitchProps } from './Switch.types.js';
import { cn } from '@/utils/utils.js';

function Switch({
  ref,
  className,
  classes,
  size = 'md',
  id,
  nativeButton,
  ...props
}: SwitchProps) {
  const checkIfButton = () => {
    if (props.render && React.isValidElement(props.render)) {
      return props.render.type === 'button';
    }
    return false;
  };

  // Check for if the <Switch /> renders a <button> based on presence of the render prop and nativeButton={true}.
  // If render prop is passed a function that returns a button instead of just passing a <button> HTML tag, it is up to the
  // consuming dev to pass nativeButton={true} to prevent duplication of ARIA props - documented in Storybook
  const isNativeButton = (nativeButton && !!props.render) || checkIfButton();
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot='switch'
      data-size={size}
      nativeButton={isNativeButton}
      id={id}
      className={cn(
        'peer group/switch relative align-self inline-flex shrink-0 items-center rounded-full px-050 border-2 border-transparent transition-transform transition-colors',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'data-checked:bg-brand-background data-unchecked:bg-transparent data-unchecked:border-base-border-strong',
        'data-[size=md]:h-500 data-[size=md]:w-[34px] data-[size=sm]:h-400 data-[size=sm]:w-700 data-[size=lg]:h-600 data-[size=lg]:w-[42px]',
        'focus-visible:ring-2 focus-visible:outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-border-subtle',
        'data-disabled:data-checked:bg-state-disabled data-disabled:data-unchecked:border-state-disabled',
        classes?.root,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'data-disabled:data-unchecked:bg-state-disabled data-disabled:data-checked:bg-brand-foreground',
          'pointer-events-none block rounded-full ring-0 transition-transform data-checked:bg-brand-foreground data-unchecked:bg-base-text',
          'group-data-[size=md]/switch:h-300 group-data-[size=md]/switch:w-300 group-data-[size=sm]/switch:h-200 group-data-[size=sm]/switch:w-200 group-data-[size=lg]/switch:h-400 group-data-[size=lg]/switch:w-400',
          'group-data-[size=md]/switch:data-checked:h-350 group-data-[size=md]/switch:data-checked:w-350 group-data-[size=sm]/switch:data-checked:h-250 group-data-[size=sm]/switch:data-checked:w-250 group-data-[size=lg]/switch:data-checked:h-450 group-data-[size=lg]/switch:data-checked:w-450',
          'data-unchecked:translate-x-0 group-data-[size=md]/switch:data-checked:translate-x-300 group-data-[size=sm]/switch:data-checked:translate-x-250 group-data-[size=lg]/switch:data-checked:translate-x-400',
          classes?.thumb,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
