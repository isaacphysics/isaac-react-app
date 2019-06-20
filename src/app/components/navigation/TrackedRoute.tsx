import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router";
import ReactGA, {FieldsObject} from "react-ga";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import * as persistance from "../../services/localStorage";
import {Unauthorised} from "../pages/Unauthorised";

ReactGA.initialize("UA-137475074-1");
ReactGA.set({ anonymizeIp: true });

const trackPage = (page: string, options?: FieldsObject) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
};

const mapStateToProps = (state: AppState) => ({user: state ? state.user : null});

interface UserFilterProps {
    user: LoggedInUser | null;
    onlyFor?: (user: LoggedInUser) => boolean;
}

type TrackedRouteProps = RouteProps & {trackingOptions?: FieldsObject; componentProps?: FieldsObject} & UserFilterProps;
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

const TrackedRouteComponent = function({component, trackingOptions, componentProps, ...rest}: TrackedRouteProps) {
    if (component) {
        if (rest.onlyFor !== undefined) {
            const {onlyFor, user, ...rest$} = rest;
            return <Route {...rest$} render={props => {
                const propsWithUser = {user, ...props};
                return <ShowLoading until={user}>
                    {user && onlyFor(user) ?
                        <WrapperComponent component={component} trackingOptions={trackingOptions} {...propsWithUser} {...componentProps} /> :
                        user && user.loggedIn && !onlyFor(user) ?
                            <Unauthorised/> : persistance.save('path', props.location.pathname) && <Redirect to="/login"/>
                    }
                </ShowLoading>;
            }}/>;
        } else {
            return <Route {...rest} render={props => {
                return <WrapperComponent component={component} trackingOptions={trackingOptions} {...props} {...componentProps} />;
            }}/>;
        }
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(rest));
    }
};

export const TrackedRoute = connect(mapStateToProps)(TrackedRouteComponent);
