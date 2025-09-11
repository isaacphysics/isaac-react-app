import { useCallback, useEffect, useState } from "react";
import { AppState, mainContentIdSlice, selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../state";
import { scrollTopOnPageLoad } from "./scrollManager";
import { history } from "./";
import { Action, Location } from "history";
import { useReducedMotion } from "./accessibility";
import { focusMainContent } from "./focus";

export const OnPageLoad = () => {
    const dispatch = useAppDispatch();
    const reducedMotion = useReducedMotion();
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const openModal = useAppSelector((state: AppState) => Boolean(state?.activeModals?.length));
    const scrollTop = scrollTopOnPageLoad(reducedMotion);
    const [loadedPathname, setLoadedPathname] = useState<string | undefined>(undefined);

    const onPageLoad = useCallback((location: Location, action: Action) => {
        if (loadedPathname !== location.pathname) {
            // this should only run on initial page load or when the pathname changes, not query params or hash changes
            dispatch(sidebarSlice.actions.setOpen(false));
            scrollTop(loadedPathname, location.pathname, action);
            setLoadedPathname(location.pathname);
            dispatch(mainContentIdSlice.actions.clear()); // reset so that if the new page sets it to the same element id, it still triggers a focus
        }
    }, [loadedPathname, dispatch, scrollTop]);

    useEffect(() => {
        if (mainContentId && (window as any).followedAtLeastOneSoftLink && !openModal) {
            // NOTE: **only** focusable elements can be .focus()ed. This will not work on e.g. a regular div. Give the element tabIndex={-1} to make it focusable.
            focusMainContent(mainContentId);
        }
    }, [mainContentId]);

    useEffect(() => {
        const unregisterListener = history.listen(onPageLoad);
        return () => unregisterListener();
    }, [onPageLoad]);

    return null;
};
