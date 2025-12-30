import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useHistoryState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const navigate = useNavigate();
    const location = useLocation();
    const existingState = location.state?.[key as keyof typeof location.state];
    const [state, setState] = useState<T>(existingState ?? initialValue);

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
    }, [navigate, location, key]);

    return [state, setHistoryAndState];
}
