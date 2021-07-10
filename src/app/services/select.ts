import React from "react";
import {ValueType} from "react-select";

export interface Item<T> {value: T; label: string;}
export function unwrapValue<T>(f: (items: Item<T>[]) => void) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}

