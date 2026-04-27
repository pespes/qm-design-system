import { isNil, isObject, some } from 'lodash-es';

// Recursively check for any undefined/null values in nested object
export const hasInvalidLeaf = (obj: any): boolean => {
  if (isNil(obj)) {
    return true;
  }
  if (isObject(obj)) {
    return some(obj, val => hasInvalidLeaf(val))
  }
  if (typeof obj === 'string') {
    return hasUnresolvedVal(obj);
  }
  return false;
}

// Check for any unresolved values in resulting string value - any string is contained in curly braces (ie. '{color.blue.500}')
export const hasUnresolvedVal = (val: string): boolean => {
  const regex = /^\{.*\}$/;
  if (regex.test(val)) {
    return true;
  }
  return false;
}