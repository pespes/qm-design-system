import type { FieldErrorType } from '@/components/composed/field/FieldWrappers.types.js';

export const cleanErrorMessages = (error: FieldErrorType) => {
  const errors = Array.isArray(error) ? error : [error];
  const errorMessages = errors.reduce((acc: string[], err) => {
    const msg = typeof err === 'object' ? err?.message : err;
    if (msg) {
      acc.push(msg);
    }
    return acc;
  }, []);
  return errorMessages;
};
