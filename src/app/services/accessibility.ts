import { useEffect, useState } from "react";
import { AppState, useAppSelector } from "../state";

export const useReducedMotion = () => {
    const { DISPLAY_SETTING: displaySettings } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const [reducedMotion, setReducedMotion] = useState<boolean>(displaySettings?.REDUCED_MOTION || false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const listener = (e: MediaQueryListEvent) => {
            setReducedMotion(e.matches || (displaySettings?.REDUCED_MOTION ?? false));
        };
        mediaQuery.addEventListener('change', listener);
        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, [displaySettings?.REDUCED_MOTION]);

    return reducedMotion;
};
