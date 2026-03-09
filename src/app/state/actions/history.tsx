import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useHistoryState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
    const navigate = useNavigate();
    const location = useLocation();
    const existingState = location.state?.[key as keyof typeof location.state];
    const [state, setState] = useState<T>(existingState ?? initialValue);
    const [loadedFromHistory, setLoadedFromHistory] = useState(existingState !== undefined);

    const setHistoryAndState = useCallback((value: React.SetStateAction<T>) => {
        // don't do anything if the value is already set (would create a new state object and not be reference-equal inside useEffect deps)
        if (value === location.state?.[key as keyof typeof location.state]) return; 

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
    }, [location, navigate, key]);

    return [state, setHistoryAndState, loadedFromHistory];
}
