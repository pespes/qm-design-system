import type { ReactNode } from 'react';
import type { ClassMap } from '@/types.js';

export type FieldWrapperClassMap = ClassMap<
  'root' | 'label' | 'errorText' | 'descriptionText'
>;

export type FieldOrientationClassMap = Omit<FieldWrapperClassMap, 'root'>;

export interface ControlRenderProps {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
  'aria-required': true | undefined;
}

export interface FieldLayoutProps {
  label: ReactNode;
  description?: ReactNode;
  descId: string;
  errorContent?: ReactNode;
  errorId: string;
  required?: boolean | undefined;
  classes?: FieldWrapperClassMap;
  controlProps: ControlRenderProps;
  children: (controlProps: ControlRenderProps) => ReactNode;
}

export interface BaseFieldProps {
  label: ReactNode;
  description?: ReactNode;
  /** Maintains backward compatible error handling from QM-UI, and allows for new Shadcn typing */
  error?: ReactNode | Array<{ message?: string } | undefined>;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  children: (controlProps: ControlRenderProps) => ReactNode;
}

export interface FieldWrapperProps extends BaseFieldProps {
  /** Explicit invalid override — defaults to !!error */
  controlId?: string | undefined;
  classes?: FieldWrapperClassMap;
  orientation?: 'vertical' | 'horizontal';
}

export interface FieldOrientationProps extends BaseFieldProps {
  descId?: string | undefined;
  errorId?: string | undefined;
  classes?: FieldOrientationClassMap;
  controlProps: ControlRenderProps;
  /** Reverse grid layout for switch controls */
  reverse?: boolean | undefined;
}
