import { useEffect, useState } from "react";
import { AppState, useAppSelector } from "../state";
import { TAG_ID } from "./constants";

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

export const ACCESSIBILITY_TAGS = ["access:visual", "access:motor"] as const;

interface AccessibilityWarning {
    label: string;
    description: string;
    icon: string;
}

export const ACCESSIBILITY_WARNINGS: Record<typeof ACCESSIBILITY_TAGS[number], AccessibilityWarning> = {
    "access:visual": {
        label: "Visual interpretation",
        description: "This content uses visual elements that may be inaccessible to screen readers.",
        icon: "icon-access-visual",
    },
    "access:motor": {
        label: "Fine motor skills",
        description: "This content uses interactive elements that may be inaccessible to some users.",
        icon: "icon-access-motor",
    },
};

export const getAccessibilityTags = (tags?: string[]) : typeof ACCESSIBILITY_TAGS[number][] => {
    return (tags?.filter(tag => tag.startsWith("access:")) || []) as typeof ACCESSIBILITY_TAGS[number][];
};

