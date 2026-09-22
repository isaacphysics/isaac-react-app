import { useCallback, useState } from "react";
import {KEY, persistence} from ".";

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

    const setStateAndLocalStorage = useCallback((value: React.SetStateAction<T>) => {
        const valueToStore = value instanceof Function ? value(state) : value;
        setState(value);
        persistence.save(key, JSON.stringify(valueToStore));
        // state must not be in deps array, but required to work value out outside of a setState fn; maybe to to look at later
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [state, setStateAndLocalStorage];
}
