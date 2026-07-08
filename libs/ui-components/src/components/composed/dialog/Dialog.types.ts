import type { ReactElement, ReactNode } from 'react';
import type {
  DialogRootProps,
  DialogPopupProps as PrimitiveDialogPopupProps,
} from '@base-ui/react/dialog';
import type { ClassMap } from '@/types.js';
import type { IconSlotProps } from '@/components/_shared/iconSlot.js';

export type DialogClassMap = ClassMap<
  | 'overlay'
  | 'header'
  | 'body'
  | 'title'
  | 'headerActionBtn'
  | 'closeBtn'
  | 'footer'
>;

type DialogPopupProps = Pick<
  PrimitiveDialogPopupProps,
  'initialFocus' | 'finalFocus' | 'className'
>;

/** ghost IconButton rendered inside the header. */
export interface DialogHeaderActionBtn {
  icon: ReactElement<IconSlotProps>;
  label: string;
  onClick: () => void;
}

export interface DialogProps extends DialogRootProps, DialogPopupProps {
  children?: ReactNode;
  ref?: React.Ref<HTMLDivElement>; //Passes to the Overlay
  classes?: DialogClassMap;

  // --- Header ---
  title?: string;
  showCloseBtn?: boolean;
  headerActionBtn?: DialogHeaderActionBtn | undefined;

  // --- Footer ---
  primaryFooterBtn?: { component: ReactElement; closesDialog: boolean };
  secondaryFooterBtn?: { component: ReactElement; closesDialog: boolean };
  footerFullWidth?: boolean;

  // --- Inline trigger when opening dialog can be handled internally by BaseUI ---
  triggerBtn?: ReactElement;
}
