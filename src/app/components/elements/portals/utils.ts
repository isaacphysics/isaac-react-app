import {useCallback, useState} from "react";

// This is a hook that abstracts the callback ref pattern, allowing for updates to a refs value (specifically one
// referring to an element) to cause component updates
export function useStatefulElementRef<T>(): [T | undefined, (ref: any) => void]{
    const [ ref, setRef ] = useState<T>();
    const updateRef = useCallback(ref => {
        if (ref !== null) {
            setRef(ref);
        }
    }, []);
    return [ref, updateRef];
}