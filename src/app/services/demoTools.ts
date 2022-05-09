import {useEffect, useState} from "react";

// Hook to allow cycling through different values in a list with a keypress - useful for demonstrating different styles
// of a front-end component without recompiling
export function useDemoValue<T>(vals: T[], toggleKey = "Q") {
    const [pointer, setPointer] = useState<number>(0);

    useEffect(() => {
        const listener = (ev: KeyboardEvent) => {
            if (ev.key.toUpperCase() === toggleKey.toUpperCase()) {
                setPointer(p => (p + 1) % vals.length);
            }
        }
        window.addEventListener("keyup", listener);
        return () => window.removeEventListener("keyup", listener);
    });

    return vals[pointer];
}