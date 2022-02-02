import {PropsValue} from "react-select";

export interface Item<T> {value: T; label: string;}

type UnwrapType<T, U> = U extends Item<T> ? false : (U extends T ? true : void);

/* REVIEW This one is not very liked in SetAssignments.tsx */
export function selectOnChange<T, U>(f: (items: U[]) => void, unwrap: UnwrapType<T, U>): (value: PropsValue<Item<T>>) => void {
    return (value: PropsValue<Item<T>>) => f((Array.isArray(value) ? value : !value ? [] : [value]).map(v => unwrap ? v.value : v));
}

/* REVIEW unwrapValue seem to be in heavy use in GameboardFilter */
export function unwrapValue<T>(f: (items: Item<T>[]) => void) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}
export function isItemEqual<T>(valueComparisonFunction: (x: T, y: T) => boolean, a: Item<T>, b: Item<T>): boolean {
    return a.label === b.label && valueComparisonFunction(a.value, b.value);
}