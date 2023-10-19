import { PropsValue } from "react-select";

export interface Item<T> {
  value: T;
  label: string;
}

export const itemise: <T>(value: T, label?: string) => Item<T> = (v, l) => ({ value: v, label: l ?? String(v) });
export const getValue: <T>(item: Item<T>) => T = ({ value }) => value;
export const getLabel: <T>(item: Item<T>) => string = ({ label }) => label;
export const toTuple: <T>(item: Item<T>) => [T, string] = ({ value, label }) => [value, label];

type UnwrapType<T, U> = U extends Item<T> ? false : U extends T ? true : void;

/* Takes a function that works on either `Item<T>[]` or `T[]` (probably some kind of state-setter function), and
   modifies it to handle taking an element of `PropsValue<Item<T>>` (the base type used in the react-select `onChange`
   event handler, that represents the new state of the select box).
   `unwrapValue` represents whether the `Item<T>`'s in the `PropsValue<Item<T>>` should have their `value` attribute
   (of type `T`) extracted or not - using conditional types, the correct value of `unwrapValue` is decided at compile
   time, based on the type of argument that `f` expects.
 */
export function selectOnChange<T, U>(
  f: (items: U[]) => void,
  unwrapValue: UnwrapType<T, U>,
): (value: PropsValue<Item<T>>) => void {
  return (value: PropsValue<Item<T>>) =>
    f((Array.isArray(value) ? value : !value ? [] : [value]).map((v) => (unwrapValue ? v.value : v)));
}

export function isItemEqual<T>(valueComparisonFunction: (x: T, y: T) => boolean, a: Item<T>, b: Item<T>): boolean {
  return a.label === b.label && valueComparisonFunction(a.value, b.value);
}
