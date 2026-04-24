import { isNil, isObject, some } from 'lodash-es';

// Recursively check for any undefined/null values in nested object
export const hasInvalidLeaf = (obj: any): boolean => {
  if (isNil(obj)) {
    return true;
  }
  if (isObject(obj)) {
    return some(obj, val => hasInvalidLeaf(val))
  }
  return false;
}
