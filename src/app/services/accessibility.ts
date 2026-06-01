import { useCallback, useEffect, useState } from "react";
import { AppState, selectors, useAppDispatch, useAppSelector } from "../state";
import { isTeacherOrAbove } from "./user";
import { below, isTouchDevice, useDeviceSize } from "./device";
import { isDefined } from "./miscUtils";
import { ACTION_TYPE } from "./constants";

export const useReducedMotion = () => {
    const { ACCESSIBILITY: accessibilitySettings } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const [reducedMotion, setReducedMotion] = useState<boolean>(false);

    const updateReducedMotion = useCallback(() => {
        setReducedMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || (accessibilitySettings?.REDUCED_MOTION ?? false));
    }, [accessibilitySettings?.REDUCED_MOTION]);

    useEffect(() => {
        // update reduced motion on accessibility settings' first load & on change
        updateReducedMotion();
    }, [updateReducedMotion]);

    useEffect(() => {
        // listen for browser media query changes to update setting
        const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        const listener = updateReducedMotion;
        mediaQuery?.addEventListener('change', listener);
        return () => {
            mediaQuery?.removeEventListener('change', listener);
        };
    }, [updateReducedMotion]);

    return reducedMotion;
};

export function useDragAndDropAccessibility() {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const accessibilityType = useAppSelector(selectors.accessibility.type);

    // Drag and drop is disabled if the user has selected a manual accessibility override, or if they have selected non-dragging inputs as an accessibility preference,
    // or if they are on a touch device or very small screen and haven't explicitly enabled drag and drop.
    const dragAndDropEnabled = (isDefined(accessibilityType) && (accessibilityType.MANUAL_OVERRIDE || accessibilityType?.NON_DRAGGING_INPUTS))
        ? !accessibilityType?.NON_DRAGGING_INPUTS
        : !(deviceSize === "xs" || (isTouchDevice() && below['md'](deviceSize)));

    const toggleDragAndDropEnabled = () => {
        dispatch({type: ACTION_TYPE.ACCESSIBILITY_TYPE_SET, accessibilityType: {"NON_DRAGGING_INPUTS": dragAndDropEnabled}});
    };

    return { dragAndDropEnabled, toggleDragAndDropEnabled };
}

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

export const useAccessibilitySettings = () => {
    // since SHOW_INACCESSIBLE_WARNING must default to true for teachers in spite of potentially being undefined, we must use this hook over accessing the state directly
    const accessibilitySettings = useAppSelector((state: AppState) => state?.userPreferences?.ACCESSIBILITY) || {};
    const user = useAppSelector((state: AppState) => state?.user);

    accessibilitySettings.SHOW_INACCESSIBLE_WARNING = accessibilitySettings?.SHOW_INACCESSIBLE_WARNING ?? isTeacherOrAbove(user);
    return accessibilitySettings;
};
