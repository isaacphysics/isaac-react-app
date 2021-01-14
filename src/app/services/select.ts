import React from "react";
import {ValueType} from "react-select";

export interface Item<T> {value: T; label: string;}
export function unwrapValue<T>(f: React.Dispatch<React.SetStateAction<Item<T>[]>>) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}

