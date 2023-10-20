function valueFromObject(object: object, predicate: string) {
  const levels = predicate.split(".");
  let value = object;
  for (const level of levels) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    value = value[level];
  }
  return value;
}
export const sortOnPredicateAndReverse = (predicate: string, reverse: boolean) => (a: object, b: object) => {
  if (valueFromObject(a, predicate) < valueFromObject(b, predicate)) {
    return reverse ? 1 : -1;
  } else if (valueFromObject(a, predicate) > valueFromObject(b, predicate)) {
    return reverse ? -1 : 1;
  } else {
    return 0;
  }
};

export function sortByNumberStringValue<T>(field: keyof T, undefinedFirst: boolean = false) {
  return function comparator(a: T, b: T) {
    const aValue: string | undefined = a[field] as any;
    const bValue: string | undefined = b[field] as any;
    if (aValue === bValue) return 0;
    if (aValue === undefined) return undefinedFirst ? -1 : 1;
    if (bValue === undefined) return undefinedFirst ? 1 : -1;
    const aInt = parseInt(aValue);
    const bInt = parseInt(bValue);
    return aInt > bInt ? 1 : aInt != bInt ? -1 : 0;
  };
}

export function sortByStringValue<T>(field: keyof T, undefinedFirst: boolean = false) {
  return function comparator(a: T, b: T) {
    const aValue: string | undefined = a[field] as any;
    const bValue: string | undefined = b[field] as any;
    if (aValue === bValue) return 0;
    if (aValue === undefined) return undefinedFirst ? -1 : 1;
    if (bValue === undefined) return undefinedFirst ? 1 : -1;
    return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: "base" });
  };
}
