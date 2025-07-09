import { useCallback, useEffect } from "react";
import { sidebarSlice, useAppDispatch } from "../state";
import { scrollTopOnPageLoad } from "./scrollManager";
import { history } from "./";
import { Action, Location } from "history";
import { useReducedMotion } from "./accessibility";

export const OnPageLoad = () => {
    const dispatch = useAppDispatch();
    const reducedMotion = useReducedMotion();
    const scroll = scrollTopOnPageLoad(reducedMotion);

    const onPageLoad = useCallback((location: Location, action: Action) => {
        dispatch(sidebarSlice.actions.setOpen(false));
        scroll(location, action);
    }, [dispatch, scroll]);

    useEffect(() => {
        const unregisterListener = history.listen(onPageLoad);
        return () => unregisterListener();
    }, [onPageLoad]);

    return null;
};
