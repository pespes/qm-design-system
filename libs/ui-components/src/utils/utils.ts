import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { tokens } from '@level/ui-tokens/json/token-keys';

// Helps tailwind-merge recognize custom QM token keys as members of right conflict
//  group. Without this, calls like `cn('rounded-md', 'rounded-400')` would fail to
// dedupe because tw-merge wouldn't know `rounded-400` belongs to the radius group.
const customTwMerge = extendTailwindMerge<'qm-typography'>({
  extend: {
    theme: {
      breakpoint: [...tokens.theme.breakpoint],
      color: [...tokens.theme.color],
      radius: [...tokens.theme.radius],
      shadow: [...tokens.theme.shadow],
      spacing: [...tokens.theme.spacing],
    },
    classGroups: {
      // opacity is predicate-based in tw-merge, so non-numeric QM keys like
      // `opacity-full` need to extend the opacity classGroup directly rather than theme.
      opacity: [{ opacity: [...tokens.theme.opacity] }],
      'qm-typography': [...tokens.utilities],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
