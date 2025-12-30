import React, {useEffect} from "react";
import {Route, RouteProps, useLocation} from "react-router";
import {docSlice, useAppDispatch} from "../../state";
import {trackPageview} from "../../services";
import { FigureNumberingContext } from "../../../IsaacAppTypes";

export const TrackedRoute = function(props: RouteProps) {
    // Store react-router's location, rather than window's location, during the react render to track changes in history so that we
    // can ensure it handles the location correctly even if there is a react-router <Redirect ...> before the useEffect is called.
    const location = useLocation();
    const dispatch = useAppDispatch();
    useEffect(() => {
        // Use window's location for the origin to match trackPageview's normal URL format - react-router does not record origin.
        trackPageview({ url: window.location.origin + location.pathname + location.search + location.hash });
        dispatch(docSlice.actions.resetPage()); // reset redux's doc after any page change
    }, [location.pathname]);

    {/* Create a figure numbering scope for each page */}
    return <FigureNumberingContext.Provider value={{}}>
        <Route {...props} />;
    </FigureNumberingContext.Provider>;
};
