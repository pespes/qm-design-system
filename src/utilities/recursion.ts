interface RootValue {
    [key : string] : RootValue | any;
}

// Creates nested object based on token's path
export const setNestedValue = (root: RootValue, path: string[], value: any) => {
  path.reduce((acc, tokenKey, idx) => {
    if (idx === path.length - 1) {
      acc[tokenKey] = value;
    } else {
      acc[tokenKey] = acc[tokenKey] || {};
    }
    return acc[tokenKey];
  }, root);
};

// Recursively check for any undefined/null values in nested object
export const hasInvalidLeaf = (obj: any): boolean => {
  // Leaf node that is null/undefined = invalid
  if (obj === undefined || obj === null) return true;

  // RN typography token returns an array, check each item
  if (Array.isArray(obj)) {
    return obj.some(item => hasInvalidLeaf(item));
  }

  // If it's an object like nested color, recurse
  if (typeof obj === 'object') {
    return Object.values(obj).some(val => hasInvalidLeaf(val));
  }
  // It's a valid leaf node
  return false;
}
