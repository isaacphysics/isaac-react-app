import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router";
import ReactGA4 from "react-ga4";
import {FigureNumberingContext, PotentialUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {selectors, useAppSelector} from "../../state";
import {
    GOOGLE_ANALYTICS_4_MEASUREMENT_ID,
    isTeacherOrAbove,
    isTutorOrAbove,
    KEY,
    persistence,
    TEACHER_REQUEST_ROUTE,
    trackPageview
} from "../../services";
import {Unauthorised} from "../pages/Unauthorised";
import {Immutable} from "immer";

ReactGA4.initialize(GOOGLE_ANALYTICS_4_MEASUREMENT_ID);
ReactGA4.set({ anonymizeIp: true });

const trackPage = (page: string) => {
    ReactGA4.set({ page });
    ReactGA4.send({ hitType: "pageview", page });
};

interface UserFilterProps {
    ifUser?: (user: Immutable<PotentialUser>) => boolean;
}

type TrackedRouteProps = RouteProps & {componentProps?: any} & UserFilterProps;
type TrackedRouteComponentProps = RouteComponentProps & {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
};

const WrapperComponent = function({component: Component, ...props}: TrackedRouteComponentProps) {
    useEffect(() => {
        trackPageview();
        trackPage(props.location.pathname);
    }, [props.location.pathname]);
    return <FigureNumberingContext.Provider value={{}}> {/* Create a figure numbering scope for each page */}
        <Component {...props} />
    </FigureNumberingContext.Provider>;
};

export const TrackedRoute = function({component, componentProps, ...rest}: TrackedRouteProps) {
    const user = useAppSelector(selectors.user.orNull);
    if (component) {
        if (rest.ifUser !== undefined) {
            const {ifUser, ...rest$} = rest;
            return <Route {...rest$} render={props => {
                const propsWithUser = {user, ...props};
                const userNeedsToBeTutorOrTeacher = rest.ifUser && [isTutorOrAbove.name, isTeacherOrAbove.name].includes(rest.ifUser.name); // TODO we should try to find a more robust way than this
                return <ShowLoading until={user}>
                    {user && ifUser(user) ?
                        <WrapperComponent component={component} {...propsWithUser} {...componentProps} /> :
                        user && !user.loggedIn && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                            persistence.save(KEY.AFTER_AUTH_PATH, props.location.pathname + props.location.search) && <Redirect to="/login"/>
                            :
                            user && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                                <Redirect to={TEACHER_REQUEST_ROUTE}/>
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
                return <WrapperComponent component={component} {...props} {...componentProps} />;
            }}/>;
        }
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(rest));
    }
};
