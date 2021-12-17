import {PropsValue} from "react-select";

export interface Item<T> {value: T; label: string;}

type UnwrapType<T, U> = U extends Item<T> ? false : true;

export function selectOnChange<T, U>(f: (items: U[]) => void, unwrap: UnwrapType<T, U>): (value: PropsValue<Item<T>>) => void {
    return (value: PropsValue<Item<T>>) => f((Array.isArray(value) ? value : !value ? [] : [value]).map(v => unwrap ? v.value : v));
}