import type React from 'react';
import type { ClassMap } from '@/types.js';

export type TextAreaClassMap = ClassMap<'root' | 'content' | 'counter'>;

export type TranslateFnProps = {
  count: number;
  maxLength: number;
};

export interface TextAreaProps extends React.ComponentProps<'textarea'> {
  testId?: string | undefined;
  translateFn?: (params: TranslateFnProps) => string;
  classes?: TextAreaClassMap;
}
