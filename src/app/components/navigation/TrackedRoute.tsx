import React, {useEffect} from "react";
import {Route, RouteComponentProps, RouteProps} from "react-router";
import ReactGA, {FieldsObject} from "react-ga";

ReactGA.initialize("UA-137475074-1");
ReactGA.set({ anonymizeIp: true });

const trackPage = (page: string, options?: FieldsObject) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
};

type TrackedRouteProps = RouteProps & {trackingOptions?: FieldsObject};
type TrackedRouteComponentProps = RouteComponentProps & {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    trackingOptions?: FieldsObject;
};

const WrapperComponent = function({component: Component, trackingOptions, ...props}: TrackedRouteComponentProps) {
    useEffect(() => {
        trackPage(props.location.pathname, trackingOptions);
    }, [props.location.pathname, trackingOptions]);
    return <Component {...props} />;
};

export const TrackedRoute = function({component, trackingOptions, ...rest}: TrackedRouteProps) {
    if (component) {
        return <Route {...rest} render={props => {
            return <WrapperComponent component={component} trackingOptions={trackingOptions} {...props} />;
        }} />;
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(rest));
    }
};