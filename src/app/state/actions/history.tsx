import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useHistoryState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
    const navigate = useNavigate();
    const location = useLocation();
    const existingState = location.state?.[key as keyof typeof location.state];
    const [state, setState] = useState<T>(existingState ?? initialValue);
    const [loadedFromHistory, setLoadedFromHistory] = useState(existingState !== undefined);

    const setHistoryAndState = useCallback((value: React.SetStateAction<T>) => {
        void navigate({
            ...location,
        }, {
            state: {
                ...location.state as Array<string>,
                [key]: value
            },
            replace: true 
        });
        setState(value);

        setLoadedFromHistory(false);
    // we necessarily update location by running this – because it is an object this causes infinite loops if in dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, key]);

    return [state, setHistoryAndState, loadedFromHistory];
}
