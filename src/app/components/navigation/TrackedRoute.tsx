import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router";
import ReactGA, {FieldsObject} from "react-ga";
import {FigureNumberingContext, PotentialUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {useAppSelector} from "../../state";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {Unauthorised} from "../pages/Unauthorised";
import {isTeacher} from "../../services/user";
import {selectors} from "../../state";
import {GOOGLE_ANALYTICS_ACCOUNT_ID} from "../../services/constants";
import {siteSpecific} from "../../services/siteConstants";

ReactGA.initialize(GOOGLE_ANALYTICS_ACCOUNT_ID);
ReactGA.set({ anonymizeIp: true });

const trackPage = (page: string, options?: FieldsObject) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
};

interface UserFilterProps {
    ifUser?: (user: PotentialUser) => boolean;
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
    return <FigureNumberingContext.Provider value={{}}> {/* Create a figure numbering scope for each page */}
        <Component {...props} />
    </FigureNumberingContext.Provider>;
};

export const TrackedRoute = function({component, trackingOptions, componentProps, ...rest}: TrackedRouteProps) {
    const user = useAppSelector(selectors.user.orNull);
    if (component) {
        if (rest.ifUser !== undefined) {
            const {ifUser, ...rest$} = rest;
            return <Route {...rest$} render={props => {
                const propsWithUser = {user, ...props};
                return <ShowLoading until={user}>
                    {user && ifUser(user) ?
                        <WrapperComponent component={component} trackingOptions={trackingOptions} {...propsWithUser} {...componentProps} /> :
                        user && !user.loggedIn && !isTeacher(user) && rest.ifUser && rest.ifUser.name === isTeacher.name ? // TODO we should try to find a more robust way than this
                            persistence.save(KEY.AFTER_AUTH_PATH, props.location.pathname + props.location.search) && <Redirect to="/login"/>
                            :
                            user && !isTeacher(user) && rest.ifUser && rest.ifUser.name === isTeacher.name ? // TODO we should try to find a more robust way than this
                                siteSpecific(
                                    // Physics
                                    <Redirect to="/pages/contact_us_teacher"/>,
                                    // Computer science
                                    <Redirect to="/pages/teacher_accounts"/>
                                )
                                :
                                user && user.loggedIn && !ifUser(user) ?
                                    <Unauthorised/>
                                    :
                                    persistence.save(KEY.AFTER_AUTH_PATH, props.location.pathname + props.location.search + props.location.hash) && <Redirect to="/login"/>
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
