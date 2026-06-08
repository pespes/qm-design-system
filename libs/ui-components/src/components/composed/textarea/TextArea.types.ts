import type React from 'react';
import type { ClassMap } from '@/types.js';

export type TextAreaClassMap = ClassMap<'root' | 'content' | 'counter'>;

export type MaxLengthTranslateFnProps = {
  count: number;
  maxLength: number;
};

export interface BaseTextAreaProps
  extends Omit<React.ComponentProps<'textarea'>, 'maxLength'> {
  testId?: string | undefined;
  classes?: TextAreaClassMap;
}

export type TextAreaProps = BaseTextAreaProps &
  (
    | {
        maxLength: number;
        maxLengthSRFunc: (params: MaxLengthTranslateFnProps) => string;
      }
    | {
        maxLength?: undefined;
        maxLengthSRFunc?: never;
      }
  );
