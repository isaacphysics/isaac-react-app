import { useCallback, useEffect } from "react";
import { scrollTopOnPageLoad } from "./scrollManager";
import { history } from "./";
import { Action, Location } from "history";
import { useReducedMotion } from "./accessibility";

export const OnPageLoad = () => {
    const reducedMotion = useReducedMotion();
    const scroll = scrollTopOnPageLoad(reducedMotion);

    const onPageLoad = useCallback((location: Location, action: Action) => {
        scroll(location, action);
    }, [scroll]);

    useEffect(() => {
        const unregisterListener = history.listen(onPageLoad);
        return () => unregisterListener();
    }, [onPageLoad]);

    return null;
};
