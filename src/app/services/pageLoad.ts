import { useCallback, useEffect, useState } from "react";
import { sidebarSlice, useAppDispatch } from "../state";
import { scrollTopOnPageLoad } from "./scrollManager";
import { history } from "./";
import { Action, Location } from "history";
import { useReducedMotion } from "./accessibility";

export const OnPageLoad = () => {
    const dispatch = useAppDispatch();
    const reducedMotion = useReducedMotion();
    const scrollTop = scrollTopOnPageLoad(reducedMotion);
    const [loadedPathname, setLoadedPathname] = useState<string | undefined>(undefined);

    const onPageLoad = useCallback((location: Location, action: Action) => {
        if (loadedPathname !== location.pathname) {
            // this should only run on initial page load or when the pathname changes, not query params or hash changes
            dispatch(sidebarSlice.actions.setOpen(false));
            scrollTop(loadedPathname, location.pathname, action);
            setLoadedPathname(location.pathname);
        }
    }, [dispatch, scrollTop, loadedPathname]);

    useEffect(() => {
        const unregisterListener = history.listen(onPageLoad);
        return () => unregisterListener();
    }, [onPageLoad]);

    return null;
};
