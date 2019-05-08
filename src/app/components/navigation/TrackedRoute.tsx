import React from "react";
import {Route, RouteProps} from "react-router";
import {withTracker} from "./withTracker";

export const TrackedRoute = function(props: RouteProps) {
    if (props.component) {
        return <Route {...props} component={withTracker(props.component)} />;
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(props));
    }
};