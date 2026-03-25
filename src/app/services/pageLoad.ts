import { useCallback, useEffect, useState } from "react";
import { AppState, docSlice, mainContentIdSlice, registerPageChange, selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../state";
import { scrollTopOnPageLoad } from "./scrollManager";
import { Location } from "history";
import { isPhy } from "./";
import { useReducedMotion } from "./accessibility";
import { focusMainContent } from "./focus";
import { useLocation } from "react-router";
import { trackPageview } from "./constants";

export const OnPageLoad = () => {
    const dispatch = useAppDispatch();
    // Use react-router's location, rather than window's location, track changes in history so that we can ensure it handles
    // the location correctly even if there is a react-router <Redirect ...> before the useEffect is called.
    const location = useLocation();
    const reducedMotion = useReducedMotion();
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const openModal = useAppSelector((state: AppState) => Boolean(state?.activeModals?.length));
    const scrollTop = scrollTopOnPageLoad(reducedMotion);
    const [loadedPathname, setLoadedPathname] = useState<string | undefined>(undefined);

    const onPageLoad = useCallback((location: Location) => {
        if (loadedPathname !== location.pathname) {
            // reset sidebar state for physics -- this should only run on initial page load or when the pathname changes, not query params or hash changes
            trackPageview({ url: window.location.origin + location.pathname + location.search + location.hash }); // record pageview on each page load
            dispatch(docSlice.actions.resetPage()); // reset redux's doc after any page change
            if (isPhy) dispatch(sidebarSlice.actions.setOpen(false));
            scrollTop(loadedPathname, location.pathname);
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

    // handle location change
    useEffect(() => {
        registerPageChange(location.pathname);
        onPageLoad(location);
    }, [location, onPageLoad]);

    return null;
};
