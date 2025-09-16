import { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";

export function useHistoryState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const history = useHistory();
    const existingState = (history.location.state as object)?.[key as keyof typeof history.location.state];
    const [state, setState] = useState<T>(existingState ?? initialValue);

    const setHistoryAndState = useCallback((value: React.SetStateAction<T>) => {
        history.replace({
            ...history.location,
            state: {
                ...history.location.state as Array<string>,
                [key]: value
            }
        });
        setState(value);
    }, [history, key]);

    return [state, setHistoryAndState];
}
