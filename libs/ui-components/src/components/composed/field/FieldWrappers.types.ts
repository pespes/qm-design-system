import type { ReactNode, ReactElement } from 'react';
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
  'aria-labelledby'?: string | undefined;
}

export interface FieldLayoutProps {
  label: string | ReactElement;
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
  label: string | ReactElement;
  description?: string | ReactElement | undefined;
  /** Maintains backward compatible error handling from QM-UI, and allows for new Shadcn typing */
  error?:
    | string
    | { message: string }
    | Array<string | { message: string }>
    | undefined;
  /** Explicit invalid override — defaults to !!error */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  children: (controlProps: ControlRenderProps) => ReactNode;
}

export interface FieldWrapperProps extends BaseFieldProps {
  controlId?: string | undefined;
  labelId?: string | undefined;
  classes?: FieldWrapperClassMap;
  /** Reverse grid layout for switch controls */
  reverse?: boolean | undefined;
  orientation?: 'vertical' | 'horizontal';
}

export interface FieldOrientationProps extends BaseFieldProps {
  descId?: string | undefined;
  errorId?: string | undefined;
  classes?: FieldOrientationClassMap;
  controlProps: ControlRenderProps;
}
