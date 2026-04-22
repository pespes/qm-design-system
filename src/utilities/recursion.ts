interface RootValue {
    [key : string] : RootValue | any;
}

// Sets value in nested object based on token's path
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