import { useEffect, useState } from "react";
import { AppState, useAppSelector } from "../state";

export const useReducedMotion = () => {
    const { ACCESSIBILITY: accessibilitySettings } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const [reducedMotion, setReducedMotion] = useState<boolean>(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || (accessibilitySettings?.REDUCED_MOTION ?? false));

    useEffect(() => {
        const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        const listener = (e: MediaQueryListEvent) => {
            setReducedMotion(e.matches || (accessibilitySettings?.REDUCED_MOTION ?? false));
        };
        mediaQuery?.addEventListener('change', listener);
        return () => {
            mediaQuery?.removeEventListener('change', listener);
        };
    }, [accessibilitySettings?.REDUCED_MOTION]);

    return reducedMotion;
};
