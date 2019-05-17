import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router";
import ReactGA, {FieldsObject} from "react-ga";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";

ReactGA.initialize("UA-137475074-1");
ReactGA.set({ anonymizeIp: true });

const trackPage = (page: string, options?: FieldsObject) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
};

interface UserFilterProps {
    onlyFor: (user: LoggedInUser) => boolean;
    user: LoggedInUser | null;
}

type MaybeUserFilterProps = UserFilterProps | {};

type TrackedRouteProps = RouteProps & {trackingOptions?: FieldsObject} & MaybeUserFilterProps;
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
        if ((rest as UserFilterProps).onlyFor !== undefined) {
            const {onlyFor, user, ...rest$} = rest as TrackedRouteProps & UserFilterProps;
            return <Route {...rest$} render={props => {
                const propsWithUser = {user, ...props};
                return <ShowLoading until={user}>
                    {user && onlyFor(user) ?
                        <WrapperComponent component={component} trackingOptions={trackingOptions} {...propsWithUser} />
                        : <Redirect to="/login"/>
                    }
                </ShowLoading>;
            }}/>;
        } else {
            return <Route {...rest} render={props => {
                return <WrapperComponent component={component} trackingOptions={trackingOptions} {...props} />;
            }}/>;
        }
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(rest));
    }
};