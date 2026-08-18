import { useState } from "react";
import {KEY, persistence} from "../../services";

export function useLocalStorageState<T>(key: KEY, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const existingValue = persistence.load(key);
        if (existingValue !== null) {
            try {
                return JSON.parse(existingValue) as T;
            } catch {
                return initialValue;
            }
        }
        return initialValue;
    });

    const setStateAndLocalStorage = (value: React.SetStateAction<T>) => {
        setState(value);
        const valueToStore = value instanceof Function ? value(state) : value;
        persistence.save(key, JSON.stringify(valueToStore));
    };

    return [state, setStateAndLocalStorage];
}
